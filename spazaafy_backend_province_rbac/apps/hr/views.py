from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import HiringRequest, JobApplication, Employee, TrainingSession, TrainingSignup
from .serializers import *

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
        req.status = 'OPEN'
        req.application_deadline = timezone.now() + timezone.timedelta(days=days)
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
        date_time = request.data.get('date_time')
        notes = request.data.get('notes')
        
        app.interview_date = date_time
        app.interview_notes = notes
        app.hiring_request.status = 'INTERVIEWING'
        app.hiring_request.save()
        app.save()
        
        # Send Email
        send_mail(
            subject=f"Interview Invitation: {app.hiring_request.role_title}",
            message=f"Dear {app.first_name},\n\nYou are invited for an interview on {date_time}.\n\nNotes: {notes}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[app.email],
            fail_silently=True
        )
        return Response({'status': 'Scheduled'})

    @action(detail=True, methods=['post'])
    def select_candidate(self, request, pk=None):
        app = self.get_object()
        app.is_selected = True
        app.save()
        
        # Update Request Status
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
        
        return Response({'status': 'Selected & Profile Created'})

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAdminUser]

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