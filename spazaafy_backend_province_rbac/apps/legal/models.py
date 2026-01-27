from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
import uuid
from datetime import timedelta

# ✅ 1. Define the Validator
def validate_file_size(value):
    limit = 10 * 1024 * 1024  # 10 MB
    if value.size > limit:
        raise ValidationError('File too large. Size should not exceed 10 MB.')

class LegalUrgency(models.TextChoices):
    ROUTINE = "ROUTINE", "Routine (7-14 Days)"
    PRIORITY = "PRIORITY", "Priority (3-5 Days)"
    URGENT = "URGENT", "Urgent (24-48 Hours)"
    CRITICAL = "CRITICAL", "Critical (Immediate/Risk)"

class LegalCategory(models.TextChoices):
    CONTRACT = "CONTRACT", "Contract / Agreement"
    POLICY = "POLICY", "Policy Document"
    IP = "IP", "Intellectual Property"
    COMPLIANCE = "COMPLIANCE", "Regulatory / Compliance"
    DISPUTE = "DISPUTE", "Dispute / Litigation"
    # ✅ NEW CATEGORY
    TERMINATION = "TERMINATION", "Termination / Resignation Review"
    OTHER = "OTHER", "Other Advisory"

class LegalStatus(models.TextChoices):
    SUBMITTED = "SUBMITTED", "Submitted"
    UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
    AMENDMENT_REQ = "AMENDMENT_REQ", "Amendment Required"
    AMENDMENT_SUBMITTED = "AMENDMENT_SUBMITTED", "Amendment Submitted"
    APPROVED = "APPROVED", "Approved & Executed"
    REJECTED = "REJECTED", "Rejected"
    FILED = "FILED", "Filed (IP/Gov)"

class LegalRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # 5.2 Standardised Submission Data
    submitter_name = models.CharField(max_length=255)
    submitter_email = models.EmailField()
    department = models.CharField(max_length=100, help_text="e.g. Field Ops, Tech, External Partner")
    
    category = models.CharField(max_length=50, choices=LegalCategory.choices)
    # ✅ NEW: Link to HR Employee (Optional, only for termination cases)
    related_employee_id = models.CharField(max_length=100, blank=True, null=True, help_text="ID of the employee if this is a HR matter")
    urgency = models.CharField(max_length=50, choices=LegalUrgency.choices, default=LegalUrgency.ROUTINE)
    
    title = models.CharField(max_length=255)
    description = models.TextField(help_text="Context, risks, and desired outcome")
    
    # The Document
    # ✅ 2. Update FileField: 
    # - upload_to: Organizes files in S3 folders (legal_intake/2024/01/...)
    # - validators: Enforces the 10MB limit
    document_file = models.FileField(
        upload_to='legal_intake/%Y/%m/', 
        validators=[validate_file_size]
    )

    # ✅ NEW: Revised Document (The amendment)
    revision_file = models.FileField(
        upload_to='legal_intake/revisions/%Y/%m/', 
        validators=[validate_file_size],
        null=True, blank=True
    )

    # ✅ NEW: Security Token for Public Upload Link
    amendment_token = models.UUIDField(null=True, blank=True)

    # ✅ NEW: Timer Logic Fields
    # When status becomes AMENDMENT_REQ, we set this.
    paused_at = models.DateTimeField(null=True, blank=True)
    
    # Accumulates total time spent in "AMENDMENT_REQ" status.
    # This value (in seconds or duration) is subtracted from the SLA calculation.
    total_paused_duration = models.DurationField(default=timedelta(0))
    
    # The specific deadline given to the user to upload the amendment.
    amendment_deadline = models.DateTimeField(null=True, blank=True)

    
    # 5.3 Tracking & Status
    status = models.CharField(max_length=50, choices=LegalStatus.choices, default=LegalStatus.SUBMITTED)
    assigned_attorney = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='legal_cases')
    
    internal_notes = models.TextField(blank=True, help_text="Privileged legal notes")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"LEG-{str(self.id)[:8]}: {self.title}"
