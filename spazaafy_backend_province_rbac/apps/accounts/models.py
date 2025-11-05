from django.contrib.auth.models import AbstractUser
from django.db import models
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