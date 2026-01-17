from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid
from datetime import timedelta

class ApplicationStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Review'
    SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
    INTERVIEWING = 'INTERVIEWING', 'Interviewing'
    SELECTED = 'SELECTED', 'Selected / Hired'
    REJECTED = 'REJECTED', 'Rejected'



# --- CONSTANTS FROM PDF ---
DEPARTMENTS = [
    ('EXECUTIVE', 'Executive & Leadership'),
    ('TECH', 'Technology & Development'),
    ('FINANCE', 'Finance & Administration'),
    ('LEGAL', 'Legal & Compliance'),
    ('SUPPORT', 'Customer Support & Internal Administration'),
    ('FIELD', 'Field Operations'),
    ('COMMUNITY', 'Community Engagement'),
    ('MEDIA', 'Media, Content & Communications'),
    ('HR', 'Training & Onboarding (HR)'),
    ('FUTURE', 'Optional / Future Roles'),
]

# (We will store the mapping in frontend/backend utils to keep models clean, 
# or use a JSONField if dynamic, but let's stick to text for simplicity)

class HiringStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Approval'
    OPEN = 'OPEN', 'Applications Open'
    CLOSED = 'CLOSED', 'Applications Closed'
    INTERVIEWING = 'INTERVIEWING', 'Interviewing'
    SELECTED = 'SELECTED', 'Candidate Selected'
    ONBOARDING = 'ONBOARDING', 'Onboarding'
    COMPLETE = 'COMPLETE', 'Complete'

class EmployeeStatus(models.TextChoices):
    ONBOARDING = 'ONBOARDING', 'Onboarding'
    EMPLOYED = 'EMPLOYED', 'Employed'
    SUSPENDED = 'SUSPENDED', 'Suspended'
    NOTICE = 'NOTICE', 'On Notice'
    RESIGNED = 'RESIGNED', 'Resigned'
    RETIRED = 'RETIRED', 'Retired'

class HiringRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.CharField(max_length=50, choices=DEPARTMENTS)
    role_title = models.CharField(max_length=255) # Selected from dropdown or typed
    request_reason = models.TextField()
    
    status = models.CharField(max_length=20, choices=HiringStatus.choices, default=HiringStatus.PENDING)
    
    # Job Posting Details
    application_deadline = models.DateTimeField(null=True, blank=True)
    job_description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_application_open(self):
        if self.status != HiringStatus.OPEN: return False
        return self.application_deadline and self.application_deadline > timezone.now()

class JobApplication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hiring_request = models.ForeignKey(HiringRequest, on_delete=models.CASCADE, related_name='applications')
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    cv_file = models.FileField(upload_to='hr/cvs/%Y/%m/')
    cover_letter = models.TextField(blank=True)

    status = models.CharField(
        max_length=20, 
        choices=ApplicationStatus.choices, 
        default=ApplicationStatus.PENDING
    )
    
    # Interview details
    interview_date = models.DateTimeField(null=True, blank=True)
    interview_notes = models.TextField(blank=True)
    
    is_selected = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

class Employee(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Link to user account if they have system access (optional but good practice)
    user_account = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    
    department = models.CharField(max_length=50, choices=DEPARTMENTS)
    role_title = models.CharField(max_length=255)
    
    status = models.CharField(max_length=20, choices=EmployeeStatus.choices, default=EmployeeStatus.ONBOARDING)
    profile_picture = models.ImageField(upload_to='hr/profiles/', null=True, blank=True)
    
    # Date tracking for auto-deletion
    status_changed_at = models.DateTimeField(auto_now=True)
    joined_at = models.DateTimeField(auto_now_add=True)

class TrainingSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    date_time = models.DateTimeField()
    description = models.TextField()
    target_departments = models.JSONField(default=list) # List of dept codes
    is_compulsory = models.BooleanField(default=False)
    
    status = models.CharField(max_length=20, default='SCHEDULED') # SCHEDULED, COMPLETED
    
    attendees = models.ManyToManyField(Employee, related_name='trainings_attended', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

class TrainingSignup(models.Model):
    # Temporary hold for signups before they are matched/confirmed
    training = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='signups')
    name = models.CharField(max_length=255)
    department = models.CharField(max_length=50)
    submitted_at = models.DateTimeField(auto_now_add=True)