# apps/accounts/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets, generics
from django.utils import timezone
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, AdminRequestCodeSerializer, AdminVerifiedRegistrationSerializer
import random
from django.core.mail import send_mail, EmailMessage # <--- Import EmailMessage
from django.conf import settings
from .models import User, AdminVerificationCode, EmailVerificationToken
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError
import traceback, sys
from datetime import timedelta
from .permissions import IsOwnerOrAdmin
from django.views.generic import TemplateView


# --- NEW ADMIN REGISTRATION VIEWS ---
class RequestAdminVerificationCodeView(generics.GenericAPIView):
    serializer_class = AdminRequestCodeSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = str(random.randint(100000, 999999))
        
        AdminVerificationCode.objects.update_or_create(
            email=email,
            defaults={'code': code, 'created_at': timezone.now()}
        )

        try:
            # --- UPDATED: Use Brevo Template for Admin Code ---
            # You need to create a template in Brevo with ID X (e.g., 3)
            # Variable in Brevo template: {{ params.CODE }}
            
            message = EmailMessage(
                to=[email],
                from_email=settings.DEFAULT_FROM_EMAIL,
            )
            
            # REPLACE '3' WITH YOUR ACTUAL ADMIN CODE TEMPLATE ID
            message.template_id = 2 
            
            message.merge_global_data = {
                'CODE': code,
            }
            
            message.send()
            # --------------------------------------------------

        except Exception as e:
            return Response({"detail": f"Failed to send email. Please check server configuration. Error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"detail": "Verification code sent."}, status=status.HTTP_200_OK)

class AdminVerifiedRegistrationView(generics.CreateAPIView):
    serializer_class = AdminVerifiedRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = serializer.save()
        except IntegrityError:
            raise ValidationError({"email": ["A user with this email already exists."]})
        except Exception as e:
            traceback.print_exc(file=sys.stderr)
            raise ValidationError({"detail": [str(e)]})

        user_data = UserSerializer(user).data
        return Response({'user': user_data}, status=status.HTTP_201_CREATED)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        if ser.is_valid():
            user = ser.save()
            return Response(ser.to_representation(user), status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = LoginSerializer(data=request.data, context={"request": request})
        if ser.is_valid():
            response_data = ser.to_representation(ser.validated_data)
            return Response(response_data, status=status.HTTP_200_OK)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({
            "id": str(u.id),
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "phone": u.phone,
            "role": u.role,
        })
    
# ✅ THIS IS THE CORRECTED VIEWSET
class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    - Admins can list all users.
    - Authenticated users can retrieve and update THEIR OWN profile.
    """
    queryset = User.objects.all().order_by('first_name')
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'list':
            # Only admins can list all users
            permission_classes = [permissions.IsAdminUser]
        else:
            # For retrieve, update, partial_update, etc.,
            # the user must be authenticated, and we'll check object-level permissions.
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        This view should return a list of all users for admin users,
        but only the current user for other authenticated users to prevent data leakage.
        """
        user = self.request.user
        if user.is_staff:
            return User.objects.all().order_by('first_name')
        return User.objects.filter(id=user.id)

class EmailVerificationConfirmView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        token_str = request.data.get('token')
        if not token_str:
            return Response({'detail': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token_obj = EmailVerificationToken.objects.get(token=token_str)
            
            if token_obj.is_expired():
                token_obj.delete()
                return Response({'detail': 'This verification link has expired.'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = token_obj.user
            if user.is_active:
                 return Response({'detail': 'Account already verified.'}, status=status.HTTP_200_OK)

            user.is_active = True
            user.save()
            
            token_obj.delete()
            
            return Response({'detail': 'Your account has been successfully verified.'}, status=status.HTTP_200_OK)
        except EmailVerificationToken.DoesNotExist:
            return Response({'detail': 'Invalid verification link.'}, status=status.HTTP_400_BAD_REQUEST)

class DeleteAccountView(APIView):
    """
    Authenticated user deletes their own account.
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user = request.user
        # If you ever want soft delete instead:
        # user.is_active = False
        # user.save(update_fields=["is_active"])
        user.delete()
        return Response(
            {"detail": "Your account and associated data have been deleted."},
            status=status.HTTP_204_NO_CONTENT,
        )


class DeleteAccountInfoView(TemplateView):
    """
    Simple info page used for Google Play's 'Delete account URL'.
    """
    template_name = "delete_account.html"
