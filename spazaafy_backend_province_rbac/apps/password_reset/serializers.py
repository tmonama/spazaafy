# apps/password_reset/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.mail import EmailMessage
from .models import PasswordResetToken

User = get_user_model()

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(
        label="Email Address",
        write_only=True
    )

    def validate_email(self, value):
        return value.lower().strip()

    def save(self):
        email = self.validated_data['email']
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # For security, return silently if email doesn't exist
            return

        # Create the token
        # Invalidate old tokens first
        PasswordResetToken.objects.filter(user=user).update(is_used=True)
        token_obj = PasswordResetToken.objects.create(user=user)

        # Build the URL (Clean URL without Hash)
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        reset_url = f"{frontend_url}/reset-password/{token_obj.token}"

        # --- BREVO EMAIL LOGIC ---
        message = EmailMessage(
            to=[user.email],
            from_email=settings.DEFAULT_FROM_EMAIL,
        )

        # ✅ TEMPLATE ID 3 (Spazaafy Password Reset)
        message.template_id = 3 

        # Pass variables to the Brevo template
        message.merge_global_data = {
            'NAME': user.first_name if user.first_name else "User",
            'RESET_LINK': reset_url,
        }

        message.send()
        # -------------------------


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.UUIDField(write_only=True)
    password = serializers.CharField(
        label="New Password",
        style={'input_type': 'password'},
        write_only=True,
        min_length=8
    )
    password_confirm = serializers.CharField(
        label="Confirm New Password",
        style={'input_type': 'password'},
        write_only=True
    )

    def validate(self, data):
        # 1. Check passwords match
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        # 2. Validate Token
        try:
            token_obj = PasswordResetToken.objects.get(token=data['token'], is_used=False)
            
            if token_obj.is_expired():
                # Don't delete immediately so we can show specific expired message
                raise serializers.ValidationError({"token": "This reset link has expired."})
            
            # Pass these objects to the save method
            data['user'] = token_obj.user
            data['token_obj'] = token_obj
            
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({"token": "Invalid or expired reset link."})

        return data

    def save(self):
        user = self.validated_data['user']
        new_password = self.validated_data['password']
        token_obj = self.validated_data['token_obj']
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        # Mark token as used
        token_obj.is_used = True
        token_obj.save()
        
        return user