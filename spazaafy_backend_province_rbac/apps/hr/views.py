from rest_framework import viewsets, generics, permissions, status
from rest_framework.views import APIView
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from apps.legal.models import LegalRequest, LegalCategory, LegalUrgency
from apps.accounts.models import AdminVerificationCode
from .models import HiringRequest, JobApplication, Employee, TrainingSession, TrainingSignup, HRComplaint, Announcement
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
    HRComplaintSerializer
)
import random
import string
from apps.core.google_calendar import create_google_meet_event
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model

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

        try:
            send_mail(
                "Spazaafy Employee Verification",
                f"Your verification code is: {code}",
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False
            )
        except Exception as e:
            return Response({"detail": "Failed to send email code."}, status=500)

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
        try:
            send_mail(
                subject="Spazaafy Employee Portal Code",
                message=f"Your verification code is: {code}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[data['email']],
                fail_silently=False
            )
        except Exception as e:
            print(e)
            return Response({"detail": "Failed to send email."}, status=500)

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
        
        # Generate link (Frontend will handle the URL structure)
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
                print(f"Google Calendar Error: {e}")
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
        
        # Send Email (same as before)
        send_mail(
            subject=f"Interview Invitation: {app.hiring_request.role_title}",
            message=f"""Dear {app.first_name},

            We are pleased to invite you for an interview.

            Date: {date_time}
            Format: {i_type}
            Location/Link: {location_text}

            Notes: {notes}

            A calendar invitation has also been sent to your email address.

            Regards,
            Spazaafy HR""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[app.email],
            fail_silently=True
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
        send_mail(
            subject="Congratulations! Job Offer from Spazaafy",
            message=f"""Dear {app.first_name},

            We are delighted to inform you that you have been selected for the position of {req.role_title}!

            Welcome to the team. We are excited to have you on board.

            Next Steps:
            You will receive further communication shortly regarding your contract, onboarding process, and training schedule.

            Congratulations again!

            Regards,
            Spazaafy HR Team""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[app.email],
            fail_silently=True
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
                if app.status != 'REJECTED': # Don't spam if already rejected
                    send_mail(
                        subject=f"Update on your application: {app.hiring_request.role_title}",
                        message=f"""Dear {app.first_name},

                        Thank you for your interest in the {app.hiring_request.role_title} position at Spazaafy and for taking the time to apply.

                        We regret to inform you that we will not be proceeding with your application at this time. We received many qualified applicants and the decision was a difficult one.

                        We wish you all the best in your future endeavors.

                        Regards,
                        Spazaafy HR Team""",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[app.email],
                        fail_silently=True
                    )

        apps_to_update.update(status=new_status)
        return Response({'detail': f'Updated {len(ids)} applications.'})

# apps/hr/views.py

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by('-joined_at')
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    # ✅ Handle Status Updates (Fail/Complete Onboarding)
    # apps/hr/views.py

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        emp = self.get_object()
        new_status = request.data.get('status')
        reason = request.data.get('reason', '')
        notice_days = request.data.get('notice_days') # Optional int

        if new_status == 'NOTICE':
            # This status now means "Resigned with Notice"
            emp.status = 'NOTICE'
            if notice_days:
                emp.notice_period_end_date = timezone.now().date() + timezone.timedelta(days=int(notice_days))
            if reason:
                emp.resignation_reason = reason
        
        elif new_status == 'EMPLOYED':
            # Restore status logic
            emp.status = 'EMPLOYED'
            emp.notice_period_end_date = None
            emp.resignation_reason = None
            
        else:
            # Standard update (Suspended, Retired, etc.)
            emp.status = new_status
            if reason:
                emp.resignation_reason = reason

        emp.save()
        return Response({'status': 'Updated'})

    # ✅ Handle Profile Picture Upload
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_photo(self, request, pk=None):
        emp = self.get_object()
        file = request.data.get('photo')
        if file:
            emp.profile_picture = file
            emp.save()
            return Response({'status': 'Photo Uploaded'})
        return Response({'detail': 'No file provided'}, status=400)
    
    @action(detail=True, methods=['post'])
    def initiate_termination(self, request, pk=None):
        emp = self.get_object()
        reason = request.data.get('reason')
        
        if not reason:
            return Response({"detail": "Reason is required"}, status=400)

        # 1. Update Employee Status
        emp.status = 'PENDING_TERMINATION'
        emp.save()
        
        # 2. Automatically Create Legal Request
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

# ✅ New ViewSet for Complaints
class HRComplaintViewSet(viewsets.ModelViewSet):
    queryset = HRComplaint.objects.all()
    serializer_class = HRComplaintSerializer
    permission_classes = [permissions.IsAdminUser]

class TrainingViewSet(viewsets.ModelViewSet):
    queryset = TrainingSession.objects.all().order_by('-date_time')
    serializer_class = TrainingSessionSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        # 1. Save the Training Session
        training = serializer.save()
        
        # 2. Check if "Push to Announcements" was requested
        post_announcement = self.request.data.get('post_announcement', False)
        
        if post_announcement:
            # Create the announcement automatically
            Announcement.objects.create(
                title=f"Training Alert: {training.title}",
                content=f"{training.description}\n\nDate: {training.date_time}\n\nCheck the Training tab to sign up.",
                author=self.request.user,
                target_departments=training.target_departments # Copy targets
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

    # GET /api/hr/portal/me/
    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            employee = request.user.employee_profile
            serializer = EmployeeSerializer(employee)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response({"detail": "No employee profile linked to this user."}, status=404)

    # ✅ UPDATED: Filter Announcements by Department
    @action(detail=False, methods=['get'])
    def announcements(self, request):
        try:
            employee = request.user.employee_profile
            dept = employee.department
            
            # Logic: Show if target_departments is empty (ALL) OR contains my department
            # Since JSONField filtering varies by DB, we can use a Python filter for safety 
            # or a specific Q lookup. For broad compatibility:
            
            all_anns = Announcement.objects.all()
            relevant_anns = []
            
            for ann in all_anns:
                targets = ann.target_departments
                # If list is empty (All) OR my dept is in list
                if not targets or dept in targets:
                    relevant_anns.append(ann)
            
            # Sort by date (newest first)
            relevant_anns.sort(key=lambda x: x.date_posted, reverse=True)
            
            return Response(AnnouncementSerializer(relevant_anns[:10], many=True).data)
        except Employee.DoesNotExist:
            return Response([])

    # POST /api/hr/portal/resign/
    @action(detail=False, methods=['post'])
    def resign(self, request):
        try:
            employee = request.user.employee_profile
            reason = request.data.get('reason')
            date = request.data.get('date')
            
            employee.status = 'RESIGNATION_REQUESTED'
            employee.resignation_reason = reason
            employee.resignation_date = date
            employee.save()
            
            # Notify HR via Email
            send_mail(
                subject=f"Resignation Request: {employee.first_name} {employee.last_name}",
                message=f"Reason: {reason}\nProposed Date: {date}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['hr@spazaafy.co.za'],
                fail_silently=True
            )
            
            return Response({'status': 'Request Submitted'})
        except Employee.DoesNotExist:
            return Response({"detail": "Profile not found"}, 404)

    # GET /api/hr/portal/complaints/
    @action(detail=False, methods=['get'])
    def my_complaints(self, request):
        try:
            employee = request.user.employee_profile
            complaints = HRComplaint.objects.filter(complainant=employee)
            return Response(HRComplaintSerializer(complaints, many=True).data)
        except:
            return Response([])

    # POST /api/hr/portal/complaints/
    @action(detail=False, methods=['post'])
    def file_complaint(self, request):
        try:
            employee = request.user.employee_profile
            HRComplaint.objects.create(
                complainant=employee,
                type=request.data.get('type', 'GRIEVANCE'),
                description=request.data.get('description')
            )
            return Response({'status': 'Complaint Filed'})
        except:
             return Response({"detail": "Error"}, 400)
        
class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    Allows HR Admins to manage company-wide announcements.
    """
    queryset = Announcement.objects.all().order_by('-date_posted')
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        # Automatically set the author to the logged-in HR user
        serializer.save(author=self.request.user)