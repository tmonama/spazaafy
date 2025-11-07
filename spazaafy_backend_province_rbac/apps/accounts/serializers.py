from datetime import timedelta

from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from apps.shops.models import Province, SpazaShop
from apps.accounts.models import AdminVerificationCode

User = get_user_model()

# Keep these in sync with the frontend (it sends 'CONSUMER' / 'OWNER' / 'ADMIN')
ROLE_CHOICES = ('CONSUMER', 'OWNER', 'ADMIN')

# Admin email gating
ALLOWED_ADMIN_DOMAINS = ['spazaafy.com', 'spazaafy.co.za']
ALLOWED_SPECIFIC_EMAILS = ['spazaafy@gmail.com']


# -----------------------------
# Request admin verification code
# -----------------------------
class AdminRequestCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        email_lower = value.strip().lower()

        # Allow exact addresses first
        if email_lower in ALLOWED_SPECIFIC_EMAILS:
            return email_lower

        # Otherwise allow specific domains
        try:
            domain = email_lower.split('@', 1)[1]
        except IndexError:
            raise serializers.ValidationError("Please enter a valid email address.")
        if domain not in ALLOWED_ADMIN_DOMAINS:
            raise serializers.ValidationError(
                "Registration is restricted to authorized personnel"
            )
        return email_lower


# --------------------------------
# Complete admin registration (OTP)
# --------------------------------
class AdminVerifiedRegistrationSerializer(serializers.ModelSerializer):
    # Extra input fields
    code = serializers.CharField(write_only=True, max_length=6)
    first_name = serializers.CharField(write_only=True, max_length=150)
    last_name = serializers.CharField(write_only=True, max_length=150)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'code')
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 8},
        }

    def validate(self, attrs):
        email = (attrs.get('email') or '').strip().lower()
        code = (attrs.get('code') or '').strip()

        # Already registered?
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")

        # Validate the code record
        try:
            verification = AdminVerificationCode.objects.get(email=email)
        except AdminVerificationCode.DoesNotExist:
            raise serializers.ValidationError("No verification code was requested for this email.")

        # Expiry (10 minutes)
        if verification.created_at < timezone.now() - timedelta(minutes=10):
            verification.delete()
            raise serializers.ValidationError("Verification code has expired. Please request a new one.")

        if verification.code != code:
            raise serializers.ValidationError("Invalid verification code.")

        # Validate password against Django validators
        validate_password(attrs.get('password'))

        # Keep normalized email
        attrs['email'] = email
        return attrs

    def create(self, validated_data):
        # Pull fields
        email = validated_data['email']
        password = validated_data['password']
        first_name = validated_data['first_name'].strip()
        last_name = validated_data['last_name'].strip()

        # Create ADMIN user. Important: provide username (email) for UserManager.create_user(...)
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='ADMIN',
        )

        user.is_staff = True
        user.save()
        # Remove used code
        AdminVerificationCode.objects.filter(email=email).delete()
        return user


# --------------------------
# Consumer/Owner registration
# --------------------------
class RegisterSerializer(serializers.Serializer):
    # Core user fields
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=[(r, r) for r in ROLE_CHOICES])

    # Optional shop fields (for OWNER)
    shop_name = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    province = serializers.PrimaryKeyRelatedField(
        queryset=Province.objects.all(),
        required=False,
        allow_null=True
    )

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def create(self, validated_data):
        # Extract shop info
        shop_name = validated_data.pop('shop_name', None)
        address = validated_data.pop('address', None)
        province = validated_data.pop('province', None)

        # Extract auth fields explicitly
        password = validated_data.pop('password')
        email = validated_data.pop('email').strip().lower()

        # Create user (use email as username)
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            **validated_data  # first_name, last_name, phone, role
        )

        # If OWNER, optionally create the shop
        if user.role == 'OWNER' and shop_name:
            SpazaShop.objects.create(
                owner=user,
                name=shop_name,
                address=address,
                province=province,
                verified=False,
            )

        return user

    def to_representation(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": getattr(user, "first_name", ""),
                "last_name": getattr(user, "last_name", ""),
                "phone": getattr(user, "phone", ""),
                "role": getattr(user, "role", ""),
            },
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


# -------------
# Login
# -------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        password = attrs.get("password")

        user = authenticate(request=self.context.get('request'), email=email, password=password)

        if not user:
            UserModel = get_user_model()
            try:
                u = UserModel.objects.get(email__iexact=email)
            except UserModel.DoesNotExist:
                u = None
            if not u or not u.check_password(password):
                raise serializers.ValidationError({"non_field_errors": ["Invalid email or password."]})
            user = u

        attrs["user"] = user
        return attrs

    def to_representation(self, attrs):
        user = attrs["user"]
        refresh = RefreshToken.for_user(user)
        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": getattr(user, "first_name", ""),
                "last_name": getattr(user, "last_name", ""),
                "phone": getattr(user, "phone", ""),
                "role": getattr(user, "role", ""),
            },
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role']
