# apps/accounts/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets, generics
from django.utils import timezone
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, 
    AdminRequestCodeSerializer, AdminVerifiedRegistrationSerializer, 
    LegalRequestCodeSerializer, LegalRegistrationSerializer, 
    TechRequestCodeSerializer, TechRegistrationSerializer,
    HRRequestCodeSerializer, HRRegistrationSerializer
)
import random
from django.conf import settings
from .models import User, AdminVerificationCode, EmailVerificationToken
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError
import traceback, sys
from datetime import timedelta
from .permissions import IsOwnerOrAdmin
from django.views.generic import TemplateView
from apps.core.utils import send_email_with_fallback
from apps.core.models import AccessLog

# Google Imports
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.tokens import RefreshToken

# --- GOOGLE AUTH VIEW ---
class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'detail': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Verify the token signature
            id_info = id_token.verify_oauth2_token(token, google_requests.Request(), audience=None)

            # 2. Manual Audience Check
            token_audience = id_info.get('aud')
            if token_audience not in settings.GOOGLE_VALID_CLIENT_IDS:
                return Response({'detail': 'Invalid Google Client ID'}, status=status.HTTP_403_FORBIDDEN)

            # 3. Extract User Info
            email = id_info.get('email')
            first_name = id_info.get('given_name', '')
            last_name = id_info.get('family_name', '')

            # 4. Check if user exists
            try:
                user = User.objects.get(email=email)
                
                # Auto-verify if they existed but were inactive
                if not user.is_active:
                    user.is_active = True
                    user.save()

                # Login Success
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    "status": "LOGIN_SUCCESS",
                    "user": UserSerializer(user).data,
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                })

            except User.DoesNotExist:
                # 5. User does not exist -> Frontend must register
                return Response({
                    "status": "REGISTER_REQUIRED",
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name
                }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({'detail': 'Invalid Google Token'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- ADMIN REGISTRATION VIEWS ---
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

        send_email_with_fallback(
            subject="Spazaafy Admin Code",
            recipient_list=[email],
            template_id=None, 
            context_data={'CODE': code},
            backup_body=f"Your Spazaafy Admin Verification Code is: {code}"
        )
        
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
    
class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    """
    queryset = User.objects.all().order_by('first_name')
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
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
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user = request.user
        user.delete()
        return Response(
            {"detail": "Your account and associated data have been deleted."},
            status=status.HTTP_204_NO_CONTENT,
        )


class DeleteAccountInfoView(TemplateView):
    template_name = "delete_account.html"


# --- PORTAL SPECIFIC REGISTRATION (LEGAL, TECH, HR) ---

class RequestLegalCodeView(generics.GenericAPIView):
    serializer_class = LegalRequestCodeSerializer
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

        send_email_with_fallback(
            subject="Spazaafy Legal Access Code",
            recipient_list=[email],
            template_id=None, 
            context_data={'CODE': code},
            backup_body=f"Your Legal Portal verification code is: {code}"
        )
        
        return Response({"detail": "Verification code sent to authorized email."}, status=200)

class LegalRegisterView(generics.CreateAPIView):
    serializer_class = LegalRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    

class RequestTechCodeView(generics.GenericAPIView):
    serializer_class = TechRequestCodeSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        code = str(random.randint(100000, 999999))
        AdminVerificationCode.objects.update_or_create(
            email=email, defaults={'code': code, 'created_at': timezone.now()}
        )

        send_email_with_fallback(
            subject="Spazaafy Tech Portal Access",
            recipient_list=[email],
            template_id=None, 
            context_data={'CODE': code},
            backup_body=f"Your Tech Portal verification code is: {code}"
        )
        
        return Response({"detail": "Code sent to authorized email."}, status=200)

class TechRegisterView(generics.CreateAPIView):
    serializer_class = TechRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

class RequestHRCodeView(generics.GenericAPIView):
    serializer_class = HRRequestCodeSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        code = str(random.randint(100000, 999999))
        AdminVerificationCode.objects.update_or_create(
            email=email, defaults={'code': code, 'created_at': timezone.now()}
        )

        send_email_with_fallback(
            subject="Spazaafy HR Portal Access",
            recipient_list=[email],
            template_id=None, 
            context_data={'CODE': code},
            backup_body=f"Your HR Portal verification code is: {code}"
        )
        
        return Response({"detail": "Code sent to authorized email."}, status=200)

class HRRegisterView(generics.CreateAPIView):
    serializer_class = HRRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    

# 1. NEW ENDPOINT: Upgrade User to Admin (Used by Tech/HR/Legal login screens)
class UpgradeToAdminView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email').strip().lower()
        code = request.data.get('code')
        target_portal = request.data.get('portal') # 'TECH', 'HR', 'LEGAL', 'ADMIN'
        
        # 1. Verify OTP
        try:
            verification = AdminVerificationCode.objects.get(email=email)
            if verification.code != code:
                return Response({"detail": "Invalid code"}, status=400)
        except AdminVerificationCode.DoesNotExist:
             return Response({"detail": "Code expired or invalid"}, status=400)

        # 2. Get Existing User (Must exist as Employee first)
        try:
            user = User.objects.get(email=email)
            # Ensure they are currently an employee or lower (don't downgrade existing admins accidentally)
            # Actually, we just want to apply the specific role now.
        except User.DoesNotExist:
            return Response({"detail": "Account not found. Please register on the Employee Portal first."}, status=404)

        # 3. Check Department Match via HR Record
        try:
            emp = Employee.objects.get(email__iexact=email)
            
            # Strict Department Check
            if target_portal == 'TECH' and emp.department != 'TECH':
                return Response({"detail": "Access Denied: You are not in the Technology department."}, status=403)
            elif target_portal == 'HR' and emp.department != 'HR':
                return Response({"detail": "Access Denied: You are not in the HR department."}, status=403)
            elif target_portal == 'LEGAL' and emp.department != 'LEGAL':
                return Response({"detail": "Access Denied: You are not in the Legal department."}, status=403)
            
            # Map to Role
            new_role = 'EMPLOYEE'
            if target_portal == 'TECH': new_role = 'TECH_ADMIN'
            elif target_portal == 'HR': new_role = 'HR_ADMIN'
            elif target_portal == 'LEGAL': new_role = 'LEGAL_ADMIN'
            elif target_portal == 'ADMIN': 
                # Only specific depts get General Admin
                if emp.department in ['SUPPORT', 'FIELD', 'FINANCE', 'EXECUTIVE', 'SALES', 'MARKETING']:
                    if emp.department == 'SUPPORT': new_role = 'SUPPORT_ADMIN'
                    elif emp.department == 'FIELD': new_role = 'FIELD_ADMIN'
                    else: new_role = 'ADMIN'
                else:
                    return Response({"detail": "Your department does not have Admin Portal access."}, status=403)
            
            # 4. Apply Upgrade
            user.role = new_role
            user.is_staff = True # Give admin site access
            user.is_active = True # Ensure they aren't suspended
            user.save()
            
            # 5. Log Access
            AccessLog.objects.create(user=user, role_granted=new_role)
            
            # Cleanup
            verification.delete()
            
            return Response({
                "detail": "Access granted. Please log in with your employee password.",
                "role": new_role
            })

        except Employee.DoesNotExist:
             return Response({"detail": "HR Record not found."}, 404)