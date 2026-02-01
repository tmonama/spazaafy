# apps/hr/views.py

from rest_framework import viewsets, generics, permissions, status
from rest_framework.views import APIView
from django.db.models import Q, Sum
from datetime import datetime, date, timedelta
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.core.mail import EmailMessage
from django.conf import settings
from apps.legal.models import LegalRequest, LegalCategory, LegalUrgency
from apps.accounts.models import AdminVerificationCode
from .models import HiringRequest, JobApplication, Employee, TrainingSession, TrainingSignup, HRComplaint, Announcement, TimeCard, TimeEntry
from .serializers import (
    HiringRequestSerializer, 
    JobApplicationSerializer, 
    EmployeeSerializer, 
    TrainingSessionSerializer, 
    TrainingSignupSerializer,
    HRComplaintSerializer,
    AnnouncementSerializer,
    EmployeeRegisterRequestSerializer, 
    EmployeeRegisterConfirmSerializer,
    TimeCardSerializer, TimeEntrySerializer
)
import random
import string
import csv
import io
from apps.core.google_calendar import create_google_meet_event
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model
from apps.core.utils import send_email_with_fallback

User = get_user_model()

def check_and_close_expired_jobs():
    """
    Checks for OPEN jobs where the deadline has passed and marks them CLOSED.
    """
    now = timezone.now()
    # Find jobs that are OPEN but deadline is in the past
    expired_jobs = HiringRequest.objects.filter(
        status='OPEN', 
        application_deadline__lt=now
    )
    # Bulk update them to CLOSED
    if expired_jobs.exists():
        count = expired_jobs.update(status='CLOSED')
        print(f"Auto-closed {count} expired hiring requests.")

class EmployeeRegisterInitView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        email = request.data.get('email', '').strip().lower()

        # 1. Validate Email Domain
        if not email.endswith('@spazaafy.co.za'):
            return Response({"detail": "Registration is restricted to @spazaafy.co.za emails."}, status=400)

        # 2. Check if Employee Record Exists (and isn't already claimed)
        try:
            employee = Employee.objects.get(
                first_name__iexact=first_name, 
                last_name__iexact=last_name
            )
            if employee.user_account:
                return Response({"detail": "This employee profile is already registered. Please log in."}, status=400)
        except Employee.DoesNotExist:
            return Response({"detail": "No employee record found matching this name. Contact HR."}, status=404)
        except Employee.MultipleObjectsReturned:
            return Response({"detail": "Multiple records found. Please contact HR to resolve duplication."}, status=400)

        # 3. Generate & Send OTP
        code = str(random.randint(100000, 999999))
        AdminVerificationCode.objects.update_or_create(
            email=email,
            defaults={'code': code, 'created_at': timezone.now()}
        )

        send_email_with_fallback(
            subject="Spazaafy Employee Verification",
            recipient_list=[email],
            template_id=None, 
            context_data={'CODE': code},
            backup_body=f"Your verification code is: {code}"
        )

        return Response({"detail": "Verification code sent to your email."}, status=200)

class EmployeeRegisterCompleteView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        code = request.data.get('code')
        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')

        # 1. Verify Code
        try:
            verification = AdminVerificationCode.objects.get(email=email)
            if verification.code != code:
                return Response({"detail": "Invalid code."}, status=400)
        except AdminVerificationCode.DoesNotExist:
            return Response({"detail": "Verification code not found or expired."}, status=400)

        # 2. Find Employee Record Again
        try:
            employee = Employee.objects.get(first_name__iexact=first_name, last_name__iexact=last_name)
        except Employee.DoesNotExist:
            return Response({"detail": "Employee record not found."}, status=404)

        # 3. Create User Account
        try:
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role='EMPLOYEE',
                is_active=True 
            )
            
            # 4. Link User to Employee Record
            employee.user_account = user
            employee.email = email # Update employee record with the registered email
            employee.save()
            
            # Cleanup code
            verification.delete()
            
            return Response({"detail": "Account created successfully."}, status=201)
        except Exception as e:
            return Response({"detail": f"Error creating account: {str(e)}"}, status=400)
        
class EmployeeRegistrationView(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def request_access(self, request):
        serializer = EmployeeRegisterRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # 1. Match HR Record
        try:
            employee = Employee.objects.get(
                first_name__iexact=data['first_name'],
                last_name__iexact=data['last_name']
            )
        except Employee.DoesNotExist:
            return Response({"detail": "No employee record found with this name. Please contact HR."}, status=404)
        except Employee.MultipleObjectsReturned:
            return Response({"detail": "Multiple records found. Please contact HR to resolve duplicate names."}, status=400)

        # 2. Check if already registered
        if employee.user_account:
            return Response({"detail": "This employee is already registered. Please log in."}, status=400)

        # 3. Generate Code
        code = str(random.randint(100000, 999999))
        AdminVerificationCode.objects.update_or_create(
            email=data['email'],
            defaults={'code': code}
        )

        # 4. Send Email
        send_email_with_fallback(
            subject="Spazaafy Employee Portal Code",
            recipient_list=[data['email']],
            template_id=None, 
            context_data={'CODE': code},
            backup_body=f"Your verification code is: {code}"
        )

        return Response({"detail": "Verification code sent."})

    @action(detail=False, methods=['post'])
    def complete_registration(self, request):
        serializer = EmployeeRegisterConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # 1. Find Employee Again (to link)
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        
        try:
            employee = Employee.objects.get(
                first_name__iexact=first_name,
                last_name__iexact=last_name
            )
        except Employee.DoesNotExist:
            return Response({"detail": "Employee record not found."}, status=404)

        # 2. Create User
        try:
            user = User.objects.create_user(
                username=data['email'],
                email=data['email'],
                password=data['password'],
                first_name=employee.first_name,
                last_name=employee.last_name,
                role='EMPLOYEE',
                is_active=True
            )
        except Exception:
            return Response({"detail": "User with this email already exists."}, status=400)

        # 3. Link User to Employee
        employee.user_account = user
        # Update email in HR record to match the confirmed one
        employee.email = data['email'] 
        employee.save()
        
        # Cleanup
        AdminVerificationCode.objects.filter(email=data['email']).delete()

        return Response({"detail": "Registration complete. Please log in."})

# --- PUBLIC VIEWS ---

class PublicHiringRequestView(generics.CreateAPIView):
    queryset = HiringRequest.objects.all()
    serializer_class = HiringRequestSerializer
    permission_classes = [permissions.AllowAny]

class PublicJobApplicationView(generics.CreateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        check_and_close_expired_jobs()
        # Verify deadline
        hiring_id = request.data.get('hiring_request')
        try:
            hiring = HiringRequest.objects.get(id=hiring_id)
            if not hiring.is_application_open:
                return Response({"detail": "Applications are closed for this position."}, status=400)
        except HiringRequest.DoesNotExist:
            return Response({"detail": "Invalid job ID"}, status=404)
            
        return super().create(request, *args, **kwargs)

class PublicTrainingSignupView(generics.CreateAPIView):
    queryset = TrainingSignup.objects.all()
    serializer_class = TrainingSignupSerializer
    permission_classes = [permissions.AllowAny]

class PublicJobDetailView(generics.RetrieveAPIView):
    """ Allows public to view job details before applying """
    queryset = HiringRequest.objects.filter(status='OPEN')
    serializer_class = HiringRequestSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # ✅ Auto-close check before showing details
        check_and_close_expired_jobs()
        # Only show OPEN jobs to public
        return HiringRequest.objects.filter(status='OPEN')

class PublicTrainingDetailView(generics.RetrieveAPIView):
    """ Allows public to view training details before signing up """
    queryset = TrainingSession.objects.all()
    serializer_class = TrainingSessionSerializer
    permission_classes = [permissions.AllowAny]


# --- ADMIN VIEWS ---

class HRAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser] 
    # (We will handle specific filtering in the frontend or separate ViewSets)

class HiringRequestViewSet(viewsets.ModelViewSet):
    queryset = HiringRequest.objects.all().order_by('-created_at')
    serializer_class = HiringRequestSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        # ✅ Auto-close check whenever Admin loads the list
        check_and_close_expired_jobs()
        return HiringRequest.objects.all().order_by('-created_at')

    @action(detail=True, methods=['post'])
    def open_applications(self, request, pk=None):
        req = self.get_object()
        days = int(request.data.get('days', 7))
        description = request.data.get('job_description', '')
        req.status = 'OPEN'
        req.application_deadline = timezone.now() + timezone.timedelta(days=days)

        if description:
            req.job_description = description

        req.save()
        
        return Response({'status': 'OPEN', 'deadline': req.application_deadline})
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        job = self.get_object()
        new_status = request.data.get('status')
        if new_status:
            job.status = new_status
            job.save()
        return Response(HiringRequestSerializer(job).data)


class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def schedule_interview(self, request, pk=None):
        app = self.get_object()
        date_time = request.data.get('date_time') # Ensure this is ISO format from frontend
        notes = request.data.get('notes')
        i_type = request.data.get('type', 'ONLINE')
        location_input = request.data.get('location', '')

        meeting_link = ""
        location_text = ""

        if i_type == 'ONLINE':
            # ✅ CALL REAL GOOGLE API
            print("Generating Google Meet link...")
            generated_link = create_google_meet_event(
                summary=f"Interview: {app.hiring_request.role_title} - {app.first_name} {app.last_name}",
                description=f"Interview for Spazaafy.\n\nNotes: {notes}",
                start_time_iso=date_time,
                attendee_email=app.email
            )
            
            if generated_link:
                meeting_link = generated_link
                location_text = f"Google Meet: {meeting_link}"
                app.interview_link = meeting_link
                app.interview_location = "Online"
            else:
                # Fallback if API fails (e.g. bad credentials)
                meeting_link = "https://meet.google.com/"
                location_text = "Google Meet (Link pending)"
                print(f"Google Calendar Error")
        else:
            location_text = location_input
            app.interview_location = location_input
            app.interview_link = ""

        app.interview_date = date_time
        app.interview_type = i_type
        app.interview_notes = notes
        app.status = 'INTERVIEWING'
        app.save()

        app.hiring_request.status = 'INTERVIEWING'
        app.hiring_request.save()
        
        # Send Email
        body = f"""Dear {app.first_name},
            We are pleased to invite you for an interview.
            Date: {date_time}
            Format: {i_type}
            Location/Link: {location_text}
            Notes: {notes}
            Regards, Spazaafy HR"""
            
        send_email_with_fallback(
            subject=f"Interview Invitation: {app.hiring_request.role_title}",
            recipient_list=[app.email],
            backup_body=body
        )
        
        return Response({'status': 'Scheduled', 'link': meeting_link})

    @action(detail=True, methods=['post'])
    def select_candidate(self, request, pk=None):
        app = self.get_object()
        app.is_selected = True
        app.status = 'SELECTED'
        app.save()
        
        req = app.hiring_request
        req.status = 'SELECTED'
        req.save()
        
        # Create Employee Profile
        Employee.objects.create(
            first_name=app.first_name,
            last_name=app.last_name,
            email=app.email,
            phone=app.phone,
            department=req.department,
            role_title=req.role_title,
            status='ONBOARDING'
        )

        # ✅ Hired Email
        body = f"""Dear {app.first_name},
            We are delighted to inform you that you have been selected for the position of {req.role_title}!
            Welcome to the team.
            Regards, Spazaafy HR Team"""
            
        send_email_with_fallback(
            subject="Congratulations! Job Offer from Spazaafy",
            recipient_list=[app.email],
            backup_body=body
        )
        
        return Response({'status': 'Selected & Profile Created'})

    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        ids = request.data.get('ids', [])
        new_status = request.data.get('status')
        
        if not ids or not new_status:
            return Response({"detail": "Missing IDs or Status"}, status=400)
            
        apps_to_update = JobApplication.objects.filter(id__in=ids)
        
        # ✅ Rejection Email Logic
        if new_status == 'REJECTED':
            for app in apps_to_update:
                if app.status != 'REJECTED': 
                    body = f"""Dear {app.first_name},
                        Thank you for your interest in the {app.hiring_request.role_title} position at Spazaafy.
                        We regret to inform you that we will not be proceeding with your application at this time.
                        Regards, Spazaafy HR Team"""
                    
                    send_email_with_fallback(
                        subject=f"Update on your application: {app.hiring_request.role_title}",
                        recipient_list=[app.email],
                        backup_body=body
                    )

        apps_to_update.update(status=new_status)
        return Response({'detail': f'Updated {len(ids)} applications.'})

# apps/hr/views.py

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by('-joined_at')
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        emp = self.get_object()
        new_status = request.data.get('status')
        reason = request.data.get('reason', '')
        notice_days = request.data.get('notice_days') 

        if new_status == 'NOTICE':
            emp.status = 'NOTICE'
            if notice_days:
                emp.notice_period_end_date = timezone.now().date() + timezone.timedelta(days=int(notice_days))
            if reason:
                emp.resignation_reason = reason
        
        elif new_status == 'EMPLOYED':
            emp.status = 'EMPLOYED'
            emp.notice_period_end_date = None
            emp.resignation_reason = None
            
        else:
            emp.status = new_status
            if reason:
                emp.resignation_reason = reason

        emp.save()
        return Response({'status': 'Updated'})

    @action(
        detail=True,
        methods=["post"],
        parser_classes=[MultiPartParser],  # 🔥 ONLY THIS
    )
    def upload_photo(self, request, pk=None):
        file = request.FILES.get("photo") or request.FILES.get("profile_picture")

        if not file:
            return Response(
                {"detail": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        employee = self.get_object()
        employee.photo = file
        employee.save()

        return Response({"detail": "Photo uploaded successfully"})
    
    @action(detail=True, methods=['post'])
    def initiate_termination(self, request, pk=None):
        emp = self.get_object()
        reason = request.data.get('reason')
        
        if not reason:
            return Response({"detail": "Reason is required"}, status=400)

        emp.status = 'PENDING_TERMINATION'
        emp.save()
        
        LegalRequest.objects.create(
            title=f"Termination Review: {emp.first_name} {emp.last_name}",
            description=f"HR Request for Termination.\nReason: {reason}",
            category=LegalCategory.TERMINATION,
            urgency=LegalUrgency.CRITICAL,
            submitter_name="HR Department",
            submitter_email="hr@spazaafy.co.za",
            department="HR",
            related_employee_id=str(emp.id)
        )
        
        return Response({'status': 'Sent to Legal'})

    @action(detail=True, methods=['post'])
    def finalize_termination(self, request, pk=None):
        emp = self.get_object()
        if emp.status != 'NOTICE_GIVEN':
            return Response({"detail": "Employee must be in 'Notice Given' stage first."}, status=400)
            
        emp.status = 'TERMINATED'
        emp.save()
        return Response({'status': 'Terminated'})

    # ✅ NEW ACTION: Transfer or Promote
    @action(detail=True, methods=['post'])
    def promote_transfer(self, request, pk=None):
        employee = self.get_object()
        action_type = request.data.get('type') # 'PROMOTION' or 'TRANSFER'
        new_department = request.data.get('department')
        new_role_title = request.data.get('role_title')
        reason = request.data.get('reason', '')

        if not new_department or not new_role_title:
            return Response({"detail": "New department and role title are required."}, status=400)

        old_dept = employee.get_department_display()
        old_role = employee.role_title

        employee.department = new_department
        employee.role_title = new_role_title
        employee.save()

        subject = ""
        message = ""

        if action_type == 'PROMOTION':
            subject = f"Congratulations! Promotion to {new_role_title}"
            message = f"Dear {employee.first_name},\n\nYou have been promoted to {new_role_title}!\nComments: {reason}\nRegards, Spazaafy HR"
        else: 
            subject = f"Update: Internal Transfer to {employee.get_department_display()}"
            message = f"Dear {employee.first_name},\n\nConfirming your transfer to {new_role_title}.\nComments: {reason}\nRegards, Spazaafy HR"

        send_email_with_fallback(subject=subject, recipient_list=[employee.email], backup_body=message)

        return Response({
            "detail": f"Employee successfully {action_type.lower()}ed.",
            "employee": EmployeeSerializer(employee).data
        })

# ✅ New ViewSet for Complaints
class HRComplaintViewSet(viewsets.ModelViewSet):
    queryset = HRComplaint.objects.all()
    serializer_class = HRComplaintSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = (MultiPartParser, FormParser, JSONParser) 

    @action(detail=True, methods=['post'])
    def mark_investigating(self, request, pk=None):
        complaint = self.get_object()
        complaint.status = 'INVESTIGATING'
        complaint.save()

        body = f"Dear {complaint.complainant.first_name},\nYour complaint is now UNDER INVESTIGATION."
        send_email_with_fallback(
            subject=f"Update on your Complaint: {complaint.id}",
            recipient_list=[complaint.complainant.email],
            backup_body=body
        )

        return Response({'status': 'Investigating'})

    @action(detail=True, methods=['post'])
    def close_complaint(self, request, pk=None):
        complaint = self.get_object()
        verdict = request.data.get('resolution_verdict')
        report = request.FILES.get('investigation_report')
        related_ids_str = request.data.get('related_employees', '')
        
        if not verdict or not report:
             return Response({"detail": "Verdict and Report are required to close a case."}, status=400)

        complaint.status = 'CLOSED'
        complaint.resolution_verdict = verdict
        complaint.investigation_report = report
        complaint.resolved_at = timezone.now()
        complaint.save()

        related_ids = [x.strip() for x in related_ids_str.split(',') if x.strip()]
        recipients = [complaint.complainant.email]
        
        if related_ids:
            related_employees = Employee.objects.filter(id__in=related_ids)
            for emp in related_employees:
                if emp.email: recipients.append(emp.email)

        body = f"Complaint {complaint.id} CLOSED.\nVerdict: {verdict}"
        
        send_email_with_fallback(
            subject=f"Case Closed: Complaint {complaint.id}",
            recipient_list=recipients,
            backup_body=body
        )

        return Response({'status': 'Closed & Emails Sent'})

class TrainingViewSet(viewsets.ModelViewSet):
    queryset = TrainingSession.objects.all().order_by('-date_time')
    serializer_class = TrainingSessionSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        training = serializer.save()
        post_announcement = self.request.data.get('post_announcement', False)
        
        if post_announcement:
            frontend_url = settings.FRONTEND_URL.rstrip('/')
            signup_link = f"{frontend_url}/training/signup?session={training.id}"
            formatted_date = training.date_time.strftime('%d %B %Y at %H:%M')

            announcement_content = (
                f"{training.description.strip()}\n\n"
                f"Date: {formatted_date}\n\n"
                f"Click the link below to register:\n"
                f"{signup_link}"
            )

            Announcement.objects.create(
                title=f"Training Alert: {training.title}",
                content=announcement_content,
                author=self.request.user,
                target_departments=training.target_departments
            )

    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        session = self.get_object()
        employee_ids = request.data.get('employee_ids', [])
        
        employees = Employee.objects.filter(id__in=employee_ids)
        session.attendees.set(employees)
        session.status = 'COMPLETED'
        session.save()
        
        return Response({'status': 'Attendance Recorded'})

class EmployeePortalViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            employee = request.user.employee_profile
            serializer = EmployeeSerializer(employee)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response({"detail": "No employee profile linked to this user."}, status=404)

    @action(detail=False, methods=['get'])
    def announcements(self, request):
        try:
            employee = request.user.employee_profile
            dept = employee.department
            
            all_anns = Announcement.objects.all()
            relevant_anns = []
            
            for ann in all_anns:
                targets = ann.target_departments
                if not targets or dept in targets:
                    relevant_anns.append(ann)
            
            relevant_anns.sort(key=lambda x: x.date_posted, reverse=True)
            
            return Response(AnnouncementSerializer(relevant_anns[:10], many=True).data)
        except Employee.DoesNotExist:
            return Response([])

    @action(detail=False, methods=['post'])
    def resign(self, request):
        try:
            employee = request.user.employee_profile
            reason = request.data.get('reason')
            date = request.data.get('date')
            exit_type = request.data.get('type', 'RESIGNATION') 

            formatted_reason = f"[{exit_type}] {reason}"
            
            employee.status = 'RESIGNATION_REQUESTED'
            employee.resignation_reason = formatted_reason
            employee.resignation_date = date
            employee.save()
            
            body = f"Type: {exit_type}\nReason: {reason}\nProposed Date: {date}"
            
            send_email_with_fallback(
                subject=f"{exit_type.title()} Request: {employee.first_name} {employee.last_name}",
                recipient_list=['hr@spazaafy.co.za'],
                backup_body=body
            )
            
            return Response({'status': 'Request Submitted'})
        except Employee.DoesNotExist:
            return Response({"detail": "Profile not found"}, 404)

    @action(detail=False, methods=['get'])
    def my_complaints(self, request):
        try:
            employee = request.user.employee_profile
            complaints = HRComplaint.objects.filter(complainant=employee)
            return Response(HRComplaintSerializer(complaints, many=True).data)
        except:
            return Response([])

    @action(detail=False, methods=['post'])
    def file_complaint(self, request):
        try:
            if not hasattr(request.user, 'employee_profile'):
                return Response({"detail": "User is not linked to an Employee profile."}, 400)

            employee = request.user.employee_profile
            HRComplaint.objects.create(
                complainant=employee,
                type=request.data.get('type', 'GRIEVANCE'),
                description=request.data.get('description')
            )
            return Response({'status': 'Complaint Filed'})

        except Exception as e:
             return Response({"detail": str(e)}, 400)
        
    @action(detail=False, methods=['get'])
    def timecards(self, request):
        employee = request.user.employee_profile
        qs = TimeCard.objects.filter(employee=employee).order_by('-work_date')[:31]
        return Response(TimeCardSerializer(qs, many=True).data)

    @action(detail=False, methods=['post'])
    def open_timecard(self, request):
        employee = request.user.employee_profile
        work_date_str = request.data.get('work_date') 
        if work_date_str:
            work_date = datetime.strptime(work_date_str, "%Y-%m-%d").date()
        else:
            work_date = timezone.now().date()

        card, _ = TimeCard.objects.get_or_create(employee=employee, work_date=work_date)
        return Response(TimeCardSerializer(card).data)

    @action(detail=False, methods=['get'], url_path=r'timecard/(?P<pk>[^/.]+)')
    def timecard_detail(self, request, pk=None):
        employee = request.user.employee_profile
        card = TimeCard.objects.get(id=pk, employee=employee)
        return Response(TimeCardSerializer(card).data)

    @action(detail=False, methods=['post'], url_path=r'timecard/(?P<pk>[^/.]+)/add_entry')
    def add_time_entry(self, request, pk=None):
        employee = request.user.employee_profile
        card = TimeCard.objects.get(id=pk, employee=employee)

        serializer = TimeEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        TimeEntry.objects.create(
            timecard=card,
            task_name=serializer.validated_data['task_name'],
            task_description=serializer.validated_data.get('task_description', ''),
            minutes=serializer.validated_data['minutes']
        )
        card.refresh_from_db()
        return Response(TimeCardSerializer(card).data)

    @action(detail=False, methods=['delete'], url_path=r'timeentry/(?P<pk>[^/.]+)')
    def delete_time_entry(self, request, pk=None):
        employee = request.user.employee_profile
        entry = TimeEntry.objects.get(id=pk, timecard__employee=employee)
        entry.delete()
        return Response({'status': 'deleted'})

    @action(detail=False, methods=['get'])
    def timecards_summary(self, request):
        employee = request.user.employee_profile
        period = request.query_params.get('period', 'week')
        date_str = request.query_params.get('date')

        base_date = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else timezone.now().date()

        if period == 'day':
            start = base_date
            end = base_date
        elif period == 'week':
            start = base_date - timedelta(days=base_date.weekday())
            end = start + timedelta(days=6)
        elif period == 'month':
            start = base_date.replace(day=1)
            next_month = (start.replace(day=28) + timedelta(days=4)).replace(day=1)
            end = next_month - timedelta(days=1)
        else:
            start = base_date.replace(month=1, day=1)
            end = base_date.replace(month=12, day=31)

        cards = TimeCard.objects.filter(employee=employee, work_date__range=[start, end])
        total_minutes = TimeEntry.objects.filter(timecard__in=cards).aggregate(s=Sum('minutes'))['s'] or 0

        breakdown = (
            TimeEntry.objects
            .filter(timecard__in=cards)
            .values('task_name')
            .annotate(total_minutes=Sum('minutes'))
            .order_by('-total_minutes')
        )

        return Response({
            'period': period,
            'start': start,
            'end': end,
            'total_minutes': total_minutes,
            'total_hours': round(total_minutes / 60.0, 2),
            'breakdown': list(breakdown),
        })

    @action(detail=False, methods=['post'])
    def send_timecard_report(self, request):
        employee = request.user.employee_profile
        email_to = request.data.get('email')
        period = request.data.get('period', 'week')
        date_str = request.data.get('date')

        if not email_to:
            return Response({"detail": "Email is required."}, status=400)

        base_date = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else timezone.now().date()

        if period == 'day':
            start = base_date
            end = base_date
        elif period == 'week':
            start = base_date - timedelta(days=base_date.weekday())
            end = start + timedelta(days=6)
        elif period == 'month':
            start = base_date.replace(day=1)
            next_month = (start.replace(day=28) + timedelta(days=4)).replace(day=1)
            end = next_month - timedelta(days=1)
        else:
            start = base_date.replace(month=1, day=1)
            end = base_date.replace(month=12, day=31)

        cards = TimeCard.objects.filter(employee=employee, work_date__range=[start, end]).order_by('work_date')

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['work_date', 'task_name', 'task_description', 'minutes', 'hours'])

        for card in cards:
            for entry in card.entries.all():
                writer.writerow([
                    card.work_date.isoformat(),
                    entry.task_name,
                    entry.task_description or '',
                    entry.minutes,
                    round(entry.minutes / 60.0, 2)
                ])

        csv_bytes = output.getvalue().encode('utf-8')
        filename = f"timecard_{employee.first_name}_{employee.last_name}_{start}_{end}.csv"

        try:
            msg = EmailMessage(
                subject=f"Time Card Report ({start} to {end})",
                body=f"Attached is the time card report for {employee.first_name} {employee.last_name} ({start} to {end}).",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email_to],
            )
            msg.attach(filename, csv_bytes, "text/csv")
            msg.send(fail_silently=False)
        except Exception as e:
            print(f"Failed to send csv email: {e}")

        return Response({'status': 'sent', 'email': email_to})

        
class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all().order_by('-date_posted')
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)