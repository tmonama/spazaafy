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
    PENDING_TERMINATION = 'PENDING_TERMINATION', 'Under Legal Review (Termination)'
    NOTICE_GIVEN = 'NOTICE_GIVEN', 'Notice Period'
    TERMINATED = 'TERMINATED', 'Terminated'
    RESIGNATION_REQUESTED = 'RESIGNATION_REQUESTED', 'Resignation Requested'
    RESIGNED = 'RESIGNED', 'Resigned'
    RETIRED = 'RETIRED', 'Retired'

class Employee(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Link to user account if they have system access (optional but good practice)
    user_account = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='employee_profile')
    
    # ✅ Resignation fields
    resignation_reason = models.TextField(blank=True, null=True)
    resignation_date = models.DateField(blank=True, null=True)
    notice_period_end_date = models.DateField(blank=True, null=True)
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    
    department = models.CharField(max_length=50, choices=DEPARTMENTS)
    role_title = models.CharField(max_length=255)
    
    status = models.CharField(
        max_length=50, 
        choices=EmployeeStatus.choices, 
        default=EmployeeStatus.ONBOARDING
    )
    profile_picture = models.ImageField(upload_to='hr/profiles/', null=True, blank=True)

    cv_file = models.FileField(upload_to='hr/employee_cvs/', null=True, blank=True) 
    
    # Date tracking for auto-deletion
    status_changed_at = models.DateTimeField(auto_now=True)
    joined_at = models.DateTimeField(auto_now_add=True)

class Announcement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    date_posted = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    target_departments = models.JSONField(default=list, blank=True)
    
    class Meta:
        ordering = ['-date_posted']

# ✅ NEW MODEL: HR COMPLAINTS
class ComplaintType(models.TextChoices):
    GRIEVANCE = 'GRIEVANCE', 'Grievance'
    MISCONDUCT = 'MISCONDUCT', 'Misconduct'
    HARASSMENT = 'HARASSMENT', 'Harassment'
    OTHER = 'OTHER', 'Other'

class HRComplaint(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    complainant = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='complaints_filed')
    respondent = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints_against')
    
    type = models.CharField(max_length=50, choices=ComplaintType.choices)
    description = models.TextField()
    status = models.CharField(max_length=20, default='OPEN') # OPEN, INVESTIGATING, RESOLVED

    # ✅ New Fields for Resolution
    investigation_report = models.FileField(upload_to='hr/complaints/reports/', null=True, blank=True)
    resolution_verdict = models.TextField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
    interview_type = models.CharField(max_length=20, choices=[('ONLINE', 'Online'), ('IN_PERSON', 'In Person')], default='ONLINE')
    interview_location = models.CharField(max_length=500, blank=True, null=True) # For physical address
    interview_link = models.URLField(blank=True, null=True) # For Google Meet
    interview_notes = models.TextField(blank=True)
    
    is_selected = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

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