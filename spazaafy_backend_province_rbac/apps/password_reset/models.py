# apps/password_reset/models.py

import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

class PasswordResetToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        """Checks if the token was created more than 2 hours ago."""
        return self.created_at + timedelta(hours=2) < timezone.now()

    def __str__(self):
        return f"Password reset token for {self.user.email}"