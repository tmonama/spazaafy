# apps/password_reset/views.py

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import PasswordResetToken
from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer

User = get_user_model()

class PasswordResetRequestView(generics.GenericAPIView):
    """
    An endpoint to request a password reset link.
    Accepts an email address and sends a reset link if the user exists.
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email__iexact=email)
            
            # Invalidate all old tokens for this user to ensure only the latest one is valid
            PasswordResetToken.objects.filter(user=user).update(is_used=True)
            
            # Create a new token
            token_obj = PasswordResetToken.objects.create(user=user)
            
            # Get the base URL for the frontend from settings
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            reset_url = f"{frontend_url}/#/reset-password/{token_obj.token}"
            
            # Send the email
            send_mail(
                subject='Your Password Reset Link for Spazaafy',
                message=f'Hi {user.first_name or "there"},\n\nPlease click the link below to reset your password:\n{reset_url}\n\nThis link will expire in 2 hours.\nIf you did not request this, please ignore this email.\n\nThanks,\nThe Spazaafy Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
        except User.DoesNotExist:
            # IMPORTANT: Do not reveal if an email address is registered or not.
            # Always return a success message to prevent user enumeration attacks.
            pass
            
        return Response(
            {'detail': 'If an account with that email exists, a password reset link has been sent.'},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    """
    An endpoint to confirm the password reset.
    Accepts a token and a new password.
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        try:
            token_obj = PasswordResetToken.objects.get(token=data['token'], is_used=False)
            
            if token_obj.is_expired():
                return Response({'detail': 'This password reset link has expired.'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = token_obj.user
            user.set_password(data['password'])
            user.save()
            
            # Mark the token as used so it cannot be used again
            token_obj.is_used = True
            token_obj.save()
            
            return Response({'detail': 'Your password has been reset successfully.'}, status=status.HTTP_200_OK)
        except PasswordResetToken.DoesNotExist:
            return Response({'detail': 'Invalid or expired password reset link.'}, status=status.HTTP_400_BAD_REQUEST)