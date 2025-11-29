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

User = get_user_model()

ROLE_CHOICES = ('CONSUMER', 'OWNER', 'ADMIN')
ALLOWED_ADMIN_DOMAINS = ['spazaafy.com', 'spazaafy.co.za']
ALLOWED_SPECIFIC_EMAILS = ['spazaafy@gmail.com']

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

        user = User.objects.create_user(username=email, email=email, password=password, is_active=False, **validated_data)

        if user.role == 'OWNER' and shop_name:
            SpazaShop.objects.create(owner=user, name=shop_name, address=address, province=province, verified=False)

        # --- EMAIL VERIFICATION LOGIC ---
        token_obj = EmailVerificationToken.objects.create(user=user)
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        verification_url = f"{frontend_url}/verify-email/{token_obj.token}"
        
        message = EmailMessage(
            to=[user.email],
            from_email=settings.DEFAULT_FROM_EMAIL,
        )

        message.template_id = 2 # Ensure this ID is correct in your Brevo/Email setup

        message.merge_global_data = {
            'NAME': user.first_name if user.first_name else "User",
            'LINK': verification_url,
        }

        message.send()

        return user

    def to_representation(self, user):
        return {"detail": "Registration successful. Please check your email to verify your account."}

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        password = attrs.get("password")

        # 1. Attempt standard authentication (Note: authenticate() returns None for inactive users)
        user = authenticate(request=self.context.get('request'), username=email, password=password)
        
        if not user:
            # 2. Authentication failed. Check if it's because the user is inactive.
            try:
                existing_user = User.objects.get(email=email)
                if existing_user.check_password(password):
                    if not existing_user.is_active:
                        # Password correct, but account inactive
                        raise serializers.ValidationError(
                            {"non_field_errors": ["Please verify your email address before logging in."]}
                        )
            except User.DoesNotExist:
                pass
            
            # 3. Genuine failure (wrong password or user doesn't exist)
            raise serializers.ValidationError({"non_field_errors": ["Invalid email or password."]})

        # 4. Double check is_active just in case a custom backend allowed it
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
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'phone', 'date_joined',]
        read_only_fields = ['email', 'role', 'date_joined']