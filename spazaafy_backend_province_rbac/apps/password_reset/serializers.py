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
            # For security reasons, we do not want to reveal if an email 
            # is registered or not. We return silently.
            return

        # Create the token
        token_obj = PasswordResetToken.objects.create(user=user)

        # Build the URL (Clean URL without Hash)
        # Example: https://spazaafy.co.za/reset-password/uuid-token
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        reset_url = f"{frontend_url}/reset-password/{token_obj.token}"

        # --- BREVO EMAIL LOGIC ---
        message = EmailMessage(
            to=[user.email],
            from_email=settings.DEFAULT_FROM_EMAIL,
        )

        # ⚠️ IMPORTANT: Replace '2' with the actual Template ID you created in Brevo
        message.template_id = 3 

        # Pass variables to the Brevo template
        # Ensure your Brevo template uses {{ params.NAME }} and {{ params.RESET_LINK }}
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
            token_obj = PasswordResetToken.objects.get(token=data['token'])
            
            if token_obj.is_expired():
                token_obj.delete()
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
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        # Delete the used token so it cannot be used again
        self.validated_data['token_obj'].delete()
        
        return user