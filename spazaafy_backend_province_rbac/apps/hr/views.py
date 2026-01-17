from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import HiringRequest, JobApplication, Employee, TrainingSession, TrainingSignup
from .serializers import *
import random
import string
from apps.core.google_calendar import create_google_meet_event
from rest_framework.parsers import MultiPartParser, FormParser

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

    # ✅ Handle Status Updates (Fail/Complete Onboarding)
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        emp = self.get_object()
        new_status = request.data.get('status')
        
        # If failing, we might want to store a reason (add a notes field later if needed)
        # For now, just update status
        emp.status = new_status
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

class TrainingViewSet(viewsets.ModelViewSet):
    queryset = TrainingSession.objects.all().order_by('-date_time')
    serializer_class = TrainingSessionSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        session = self.get_object()
        employee_ids = request.data.get('employee_ids', [])
        
        employees = Employee.objects.filter(id__in=employee_ids)
        session.attendees.set(employees)
        session.status = 'COMPLETED'
        session.save()
        
        return Response({'status': 'Attendance Recorded'})