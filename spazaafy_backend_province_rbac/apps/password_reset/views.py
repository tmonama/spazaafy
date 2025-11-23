# apps/password_reset/views.py

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer

class PasswordResetRequestView(generics.GenericAPIView):
    """
    An endpoint to request a password reset link.
    The logic for sending the email via Brevo is inside the Serializer's save() method.
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # ✅ FIX: Call save() to trigger the Brevo email logic defined in the serializer
        serializer.save()
        
        return Response(
            {'detail': 'If an account with that email exists, a password reset link has been sent.'},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    """
    An endpoint to confirm the password reset.
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # ✅ FIX: Call save() to actually change the password
        serializer.save()
        
        return Response(
            {'detail': 'Your password has been reset successfully.'}, 
            status=status.HTTP_200_OK
        )