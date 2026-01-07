from django.contrib.auth.models import AbstractUser
from datetime import timedelta
from django.conf import settings
from django.db import models
from django.utils import timezone
from apps.core.models import Province
import uuid

class User(AbstractUser):
    class Roles(models.TextChoices):
        CONSUMER="CONSUMER","Consumer"
        OWNER="OWNER","Spaza Owner"
        ADMIN="ADMIN","Admin"
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.CONSUMER)
    phone = models.CharField(max_length=30, blank=True)
    province = models.ForeignKey(Province, null=True, blank=True, on_delete=models.SET_NULL,
        help_text='If set for ADMIN, user is a Province Admin. If null and ADMIN, user is Global Admin.')
    
    # ✅ NEW: Fields for tracking verification reminders
    reminders_sent_count = models.IntegerField(default=0)
    last_reminder_sent_at = models.DateTimeField(null=True, blank=True)
    expo_push_token = models.CharField(max_length=255, blank=True, null=True)
    
    # --- ADD THIS METHOD ---
    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        """
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def __str__(self):
        return self.email

class AdminVerificationCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Code for {self.email}"
    

class EmailVerificationToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        """Checks if the token was created more than 24 hours ago."""
        return self.created_at + timedelta(hours=24) < timezone.now()

    def __str__(self):
        return f"Email verification token for {self.user.email}"