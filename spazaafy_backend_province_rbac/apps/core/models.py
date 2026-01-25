from django.db import models
from django.conf import settings
import uuid

class Province(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name


class Campaign(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, default='OPEN', choices=[('OPEN', 'Open'), ('CLOSED', 'Closed')])
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name

class EmailTemplate(models.Model):
    PURPOSE_CHOICES = [
        ('GENERAL', 'General'),
        ('NEW_FEATURE', 'New Features'),
        ('UPDATE', 'Updates'),
        ('EVENT', 'Events'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='templates')
    name = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    purpose = models.CharField(max_length=50, choices=PURPOSE_CHOICES, default='GENERAL')
    content = models.TextField() # HTML or Plain Text
    links = models.JSONField(default=list, blank=True) # List of {label:str, url:str, type:'button'|'text'}
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.campaign.name})"
    

class EmailLog(models.Model):
    STATUS_CHOICES = [
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(EmailTemplate, on_delete=models.CASCADE, related_name='logs')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    recipient_email = models.EmailField() # Keep email even if user is deleted
    
    # Store the specific group selected during sending (e.g., 'HR', 'TECH', 'CONSUMER')
    target_group = models.CharField(max_length=50) 
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    error_message = models.TextField(blank=True, null=True)
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.recipient_email} - {self.status}"