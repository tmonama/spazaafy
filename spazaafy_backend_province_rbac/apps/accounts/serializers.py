# apps/accounts/serializers.py

from datetime import timedelta
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from apps.shops.models import Province, SpazaShop
from .models import AdminVerificationCode, EmailVerificationToken
from django.conf import settings
from django.core.mail import EmailMessage
from apps.hr.models import Employee

# Google Imports
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

User = get_user_model()

ROLE_CHOICES = ('CONSUMER', 'OWNER', 'ADMIN')
ALLOWED_ADMIN_DOMAINS = ['spazaafy.com', 'spazaafy.co.za']
ALLOWED_SPECIFIC_EMAILS = ['spazaafy@gmail.com', 'admin@spazaafy.co.za']

class AdminRequestCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        email_lower = value.strip().lower()
        if email_lower in ALLOWED_SPECIFIC_EMAILS:
            return email_lower
        try:
            domain = email_lower.split('@', 1)[1]
        except IndexError:
            raise serializers.ValidationError("Please enter a valid email address.")
        if domain not in ALLOWED_ADMIN_DOMAINS:
            raise serializers.ValidationError("Registration is restricted to authorized personnel")
        return email_lower

class AdminVerifiedRegistrationSerializer(serializers.ModelSerializer):
    code = serializers.CharField(write_only=True, max_length=6)
    first_name = serializers.CharField(write_only=True, max_length=150)
    last_name = serializers.CharField(write_only=True, max_length=150)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'code')
        extra_kwargs = {'password': {'write_only': True, 'min_length': 8}}

    def validate(self, attrs):
        email = (attrs.get('email') or '').strip().lower()
        code = (attrs.get('code') or '').strip()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        try:
            verification = AdminVerificationCode.objects.get(email=email)
        except AdminVerificationCode.DoesNotExist:
            raise serializers.ValidationError("No verification code was requested for this email.")
        if verification.created_at < timezone.now() - timedelta(minutes=10):
            verification.delete()
            raise serializers.ValidationError("Verification code has expired. Please request a new one.")
        if verification.code != code:
            raise serializers.ValidationError("Invalid verification code.")
        validate_password(attrs.get('password'))
        attrs['email'] = email
        return attrs

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        first_name = validated_data['first_name'].strip()
        last_name = validated_data['last_name'].strip()
        user = User.objects.create_user(username=email, email=email, password=password, first_name=first_name, last_name=last_name, role='ADMIN')
        user.is_staff = True
        user.save()
        AdminVerificationCode.objects.filter(email=email).delete()
        return user

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=[(r, r) for r in ROLE_CHOICES])
    shop_name = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    province = serializers.PrimaryKeyRelatedField(queryset=Province.objects.all(), required=False, allow_null=True)

    # ✅ NEW: Accept Google Token to verify identity
    google_token = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def create(self, validated_data):
        shop_name = validated_data.pop('shop_name', None)
        address = validated_data.pop('address', None)
        province = validated_data.pop('province', None)
        password = validated_data.pop('password')
        email = validated_data.pop('email').strip().lower()
        google_token = validated_data.pop('google_token', None)

        # ✅ Check if this is a verified Google Registration
        is_google_verified = False
        if google_token:
            try:
                # We do not pass 'audience' here because we check it manually if needed, 
                # or trust verify_oauth2_token's signature check.
                id_info = id_token.verify_oauth2_token(google_token, google_requests.Request(), audience=None)
                
                # Security Check: Ensure the token email matches the form email
                if id_info.get('email') == email:
                    # Optional: Check if aud matches one of our IDs
                    if id_info.get('aud') in settings.GOOGLE_VALID_CLIENT_IDS:
                        is_google_verified = True
            except Exception as e:
                print(f"Google Token Verification Failed during register: {e}")
                is_google_verified = False

        # ✅ Create user with active status if Google Verified
        user = User.objects.create_user(
            username=email, 
            email=email, 
            password=password, 
            is_active=is_google_verified,  # Auto-activate if Google
            **validated_data
        )

        if user.role == 'OWNER' and shop_name:
            SpazaShop.objects.create(owner=user, name=shop_name, address=address, province=province, verified=False)

        # --- EMAIL VERIFICATION LOGIC (Only if NOT Google) ---
        if not is_google_verified:
            token_obj = EmailVerificationToken.objects.create(user=user)
            frontend_url = settings.FRONTEND_URL.rstrip('/')
            verification_url = f"{frontend_url}/verify-email/{token_obj.token}"
            
            message = EmailMessage(
                to=[user.email],
                from_email=settings.DEFAULT_FROM_EMAIL,
            )
            message.template_id = 2 
            message.merge_global_data = {
                'NAME': user.first_name if user.first_name else "User",
                'LINK': verification_url,
            }
            message.send()

        return user

    def to_representation(self, user):
        # If active, it means they registered via Google and can login immediately
        if user.is_active:
            return {"detail": "Account created successfully. You can now login."}
        return {"detail": "Registration successful. Please check your email to verify your account."}

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        password = attrs.get("password")
        user = authenticate(request=self.context.get('request'), username=email, password=password)

        # ✅ FORCE RELOAD from DB to be safe
        user = User.objects.get(pk=user.pk) 
        
        if not user:
            try:
                existing_user = User.objects.get(email=email)
                if existing_user.check_password(password):
                    if not existing_user.is_active:
                        raise serializers.ValidationError({"non_field_errors": ["Please verify your email address before logging in."]})
            except User.DoesNotExist:
                pass
            raise serializers.ValidationError({"non_field_errors": ["Invalid email or password."]})

        if not user.is_active:
            raise serializers.ValidationError({"non_field_errors": ["Please verify your email address before logging in."]})
        
        attrs["user"] = user
        return attrs

    def to_representation(self, attrs):
        user = attrs["user"]
        refresh = RefreshToken.for_user(user)
        return {
            "user": { "id": str(user.id), "email": user.email, "first_name": user.first_name, "last_name": user.last_name, "phone": user.phone, "role": user.role },
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'phone', 'date_joined', 'expo_push_token']
        read_only_fields = ['email', 'role', 'date_joined']


# ✅ DEFINE THE STRICT ALLOW LIST
ALLOWED_LEGAL_EMAILS = [
    'spazaafy@gmail.com',
    'legal.internal@spazaafy.co.za',
    'thakgalangmonama@gmail.com',
    'compliance.internal@spazaafy.co.za',
    'contracts.internal@spazaafy.co.za',
    'legal.director.internal@spazaafy.co.za',
    'legal.archive.internal@spazaafy.co.za'
]

# ==============================================================================
# LEGAL PORTAL SERIALIZERS
# ==============================================================================

class LegalRequestCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        
        # 1. Domain Check
        if not email.endswith('@spazaafy.co.za'):
            raise serializers.ValidationError("Registration restricted to @spazaafy.co.za emails.")

        # 2. HR Employee Check & Department Check
        try:
            employee = Employee.objects.get(email__iexact=email)
            # Optional: Enforce Department
            if employee.department != 'LEGAL':
                raise serializers.ValidationError("Access Denied: You are not listed in the Legal Department.")
        except Employee.DoesNotExist:
            raise serializers.ValidationError("Access Denied: No employee record found. Please contact HR.")
            
        return email

class LegalRegistrationSerializer(serializers.ModelSerializer):
    code = serializers.CharField(write_only=True, max_length=6)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'code')
        extra_kwargs = {'password': {'write_only': True, 'min_length': 8}}

    def validate(self, attrs):
        email = (attrs.get('email') or '').strip().lower()
        code = (attrs.get('code') or '').strip()

        # 1. Re-validate domain & Employee status (Security)
        if not email.endswith('@spazaafy.co.za'):
             raise serializers.ValidationError("Invalid email domain.")
        
        if not Employee.objects.filter(email__iexact=email, department='LEGAL').exists():
             raise serializers.ValidationError("Employee record not found or not in Legal department.")

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("User already exists. Please log in.")

        try:
            verification = AdminVerificationCode.objects.get(email=email)
            if verification.code != code:
                raise serializers.ValidationError("Invalid verification code.")
        except AdminVerificationCode.DoesNotExist:
            raise serializers.ValidationError("No verification code found.")

        return attrs

    def create(self, validated_data):
        # ... (Same logic: Create User, link if needed) ...
        user = User.objects.create_user(
            username=validated_data['email'], 
            email=validated_data['email'], 
            password=validated_data['password'], 
            first_name=validated_data['first_name'], 
            last_name=validated_data['last_name'], 
            role='ADMIN' # or 'LEGAL' if you have specific roles
        )
        user.is_staff = True
        user.save()
        
        # Link to Employee Profile
        try:
            emp = Employee.objects.get(email__iexact=validated_data['email'])
            emp.user_account = user
            emp.save()
        except:
            pass

        AdminVerificationCode.objects.filter(email=validated_data['email']).delete()
        return user
    

# ✅ 1. Define Authorized Tech Emails
ALLOWED_TECH_EMAILS = [
    'spazaafy@gmail.com',
    'tech@spazaafy.co.za',
    'engineering@spazaafy.co.za',
    'dev@spazaafy.co.za',
    'backend@spazaafy.co.za',
    'frontend@spazaafy.co.za',
    'mobile@spazaafy.co.za',
    'qa@spazaafy.co.za',
    'ux@spazaafy.co.za',
    'cto@spazaafy.co.za',
    'thakgalang.m@spazaafy.co.za'
]

# ==============================================================================
# TECH PORTAL SERIALIZERS
# ==============================================================================

# ✅ 2. Tech Code Request Serializer
class TechRequestCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        
        if not email.endswith('@spazaafy.co.za'):
            raise serializers.ValidationError("Registration restricted to @spazaafy.co.za emails.")

        try:
            employee = Employee.objects.get(email__iexact=email)
            if employee.department != 'TECH':
                raise serializers.ValidationError("Access Denied: You are not listed in the Tech Department.")
        except Employee.DoesNotExist:
            raise serializers.ValidationError("Access Denied: No employee record found. Please contact HR.")
            
        return email

# ✅ 3. Tech Registration Serializer
class TechRegistrationSerializer(serializers.ModelSerializer):
    code = serializers.CharField(write_only=True, max_length=6)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'code')
        extra_kwargs = {'password': {'write_only': True, 'min_length': 8}}

    def validate(self, attrs):
        email = (attrs.get('email') or '').strip().lower()
        code = (attrs.get('code') or '').strip()

        if not email.endswith('@spazaafy.co.za'):
             raise serializers.ValidationError("Invalid email domain.")
        
        if not Employee.objects.filter(email__iexact=email, department='TECH').exists():
             raise serializers.ValidationError("Employee record not found or not in Tech department.")

        if User.objects.filter(email__iexact=email).exists():
             raise serializers.ValidationError("User already exists.")

        try:
            verification = AdminVerificationCode.objects.get(email=email)
            if verification.code != code:
                raise serializers.ValidationError("Invalid verification code.")
        except AdminVerificationCode.DoesNotExist:
            raise serializers.ValidationError("No verification code found.")

        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'], 
            email=validated_data['email'], 
            password=validated_data['password'], 
            first_name=validated_data['first_name'], 
            last_name=validated_data['last_name'], 
            role='ADMIN'
        )
        user.is_staff = True
        user.save()
        
        try:
            emp = Employee.objects.get(email__iexact=validated_data['email'])
            emp.user_account = user
            emp.save()
        except: pass

        AdminVerificationCode.objects.filter(email=validated_data['email']).delete()
        return user
    
    
# ✅ DEFINE HR ALLOW LIST
ALLOWED_HR_EMAILS = [
    'hr@spazaafy.co.za',
    'recruitment@spazaafy.co.za',
    'people@spazaafy.co.za',
    'payroll@spazaafy.co.za',
    'training@spazaafy.co.za',
    'thakgalangmonama@gmail.com',
    'spazaafy@gmail.com'
]

# ==============================================================================
# HR PORTAL SERIALIZERS
# ==============================================================================

# ✅ HR Code Request Serializer
class HRRequestCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        
        # HR might allow specific external consultants OR just strict domain
        # Assuming strict domain + HR department check
        if not email.endswith('@spazaafy.co.za'):
            raise serializers.ValidationError("Registration restricted to @spazaafy.co.za emails.")

        try:
            employee = Employee.objects.get(email__iexact=email)
            if employee.department != 'HR':
                raise serializers.ValidationError("Access Denied: You are not listed in the HR Department.")
        except Employee.DoesNotExist:
            raise serializers.ValidationError("Access Denied: No employee record found. Please contact HR.")
            
        return email

# ✅ HR Registration Serializer
class HRRegistrationSerializer(serializers.ModelSerializer):
    code = serializers.CharField(write_only=True, max_length=6)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'code')

    def validate(self, attrs):
        email = (attrs.get('email') or '').strip().lower()
        code = (attrs.get('code') or '').strip()

        if not email.endswith('@spazaafy.co.za'):
             raise serializers.ValidationError("Invalid email domain.")
        
        if not Employee.objects.filter(email__iexact=email, department='HR').exists():
             raise serializers.ValidationError("Employee record not found or not in HR department.")

        if User.objects.filter(email__iexact=email).exists():
             raise serializers.ValidationError("User already exists.")

        try:
            verification = AdminVerificationCode.objects.get(email=email)
            if verification.code != code:
                raise serializers.ValidationError("Invalid verification code.")
        except AdminVerificationCode.DoesNotExist:
            raise serializers.ValidationError("No verification code found.")

        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'], 
            email=validated_data['email'], 
            password=validated_data['password'], 
            first_name=validated_data['first_name'], 
            last_name=validated_data['last_name'], 
            role='ADMIN'
        )
        user.is_staff = True
        user.save()
        
        try:
            emp = Employee.objects.get(email__iexact=validated_data['email'])
            emp.user_account = user
            emp.save()
        except: pass

        AdminVerificationCode.objects.filter(email=validated_data['email']).delete()
        return user