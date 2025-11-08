# apps/accounts/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets, generics, serializers
from .models import User
from django.utils import timezone
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, AdminRequestCodeSerializer, AdminVerifiedRegistrationSerializer, AdminVerificationCode
import random
from django.core.mail import send_mail
from django.conf import settings
from .models import AdminVerificationCode
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError
import traceback, sys
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from datetime import timedelta
from .models import User, AdminVerificationCode, EmailVerificationToken # Add EmailVerificationToken


# --- NEW ADMIN REGISTRATION VIEWS ---
class RequestAdminVerificationCodeView(generics.GenericAPIView):
    serializer_class = AdminRequestCodeSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = str(random.randint(100000, 999999))
        
        obj, created = AdminVerificationCode.objects.update_or_create(
            email=email,
            defaults={'code': code}
        )
        if not created:
            # refresh timestamp so the code is valid for the next 10 minutes
            AdminVerificationCode.objects.filter(email=email).update(
                created_at=timezone.now()
        )


        print("--- EMAIL_BACKEND:", settings.EMAIL_BACKEND)
        print("--- EMAIL_HOST:", getattr(settings, "EMAIL_HOST", None))
        print("--- EMAIL_HOST_USER:", getattr(settings, "EMAIL_HOST_USER", None))
        print("--- DEFAULT_FROM_EMAIL:", getattr(settings, "DEFAULT_FROM_EMAIL", None))

        try:
            send_mail(
                subject='Your Spazaafy Admin Verification Code',
                message=f'Your verification code is: {code}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
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
        except TypeError as e:
            # e.g., your User model requires username; add username=email in serializer.create()
            raise ValidationError({"detail": [str(e)]})
        except Exception as e:
            # log full traceback to Render logs for quick diagnosis
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
            # This is correct because the RegisterSerializer's to_representation is called
            return Response(ser.to_representation(user), status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = LoginSerializer(data=request.data, context={"request": request})
        if ser.is_valid():
            # ✅ FIX: Call to_representation on the validated data
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
            "first_name": getattr(u, "first_name", ""),
            "last_name": getattr(u, "last_name", ""),
            "phone": getattr(u, "phone", ""),
            "role": u.role,
        })
    
    # --- THIS IS THE MISSING VIEWSET ---
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing user instances.
    Only accessible by admin users.
    """
    queryset = User.objects.all().order_by('first_name')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]



class EmailVerificationConfirmView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        token_str = request.data.get('token')
        if not token_str:
            return Response({'detail': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token_obj = EmailVerificationToken.objects.get(token=token_str)
            
            if token_obj.is_expired():
                # For security, delete the expired token
                token_obj.delete()
                return Response({'detail': 'This verification link has expired.'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = token_obj.user
            if user.is_active:
                 return Response({'detail': 'Account already verified.'}, status=status.HTTP_200_OK)

            user.is_active = True
            user.save()
            
            # Delete the token so it cannot be used again
            token_obj.delete()
            
            return Response({'detail': 'Your account has been successfully verified.'}, status=status.HTTP_200_OK)
        except EmailVerificationToken.DoesNotExist:
            return Response({'detail': 'Invalid verification link.'}, status=status.HTTP_400_BAD_REQUEST)