from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from datetime import timedelta
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from apps.shops.models import Province, SpazaShop
from .models import AdminVerificationCode

User = get_user_model()

# Keep these in sync with the frontend (it sends 'CONSUMER' / 'OWNER' / 'ADMIN')
ROLE_CHOICES = ('CONSUMER', 'OWNER', 'ADMIN')
ALLOWED_ADMIN_DOMAINS = ['spazaafy.com', 'spazaafy.co.za']
ALLOWED_SPECIFIC_EMAILS = ['spazaafy@gmail.com']


# --- NEW SERIALIZER FOR REQUESTING A CODE ---
class AdminRequestCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        # ✅ THE FIX: Update validation logic
        email_lower = value.lower()

        # 1. First, check if the email is in the specific allowed list
        if email_lower in ALLOWED_SPECIFIC_EMAILS:
            return value # It's valid, we're done.

        # 2. If not, check if the domain is in the allowed list
        try:
            domain = email_lower.split('@')[1]
            if domain in ALLOWED_ADMIN_DOMAINS:
                return value # Domain is valid, we're done.
        except IndexError:
             # This handles cases where there's no '@' symbol
            raise serializers.ValidationError("Please enter a valid email address.")

        # 3. If neither condition was met, it's invalid.
        raise serializers.ValidationError("Registration is restricted to authorized personnel")
    

# --- NEW SERIALIZER FOR VERIFIED REGISTRATION ---
class AdminVerifiedRegistrationSerializer(serializers.ModelSerializer):
    code = serializers.CharField(write_only=True, required=True, max_length=6)

    class Meta:
        model = User
        fields = ('email', 'password', 'code')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        email = data.get('email')
        code = data.get('code')
        
        try:
            verification = AdminVerificationCode.objects.get(email=email)
            if verification.created_at < timezone.now() - timedelta(minutes=10):
                verification.delete()
                raise serializers.ValidationError("Verification code has expired. Please request a new one.")
            
            if verification.code != code:
                raise serializers.ValidationError("Invalid verification code.")

        except AdminVerificationCode.DoesNotExist:
            raise serializers.ValidationError("No verification code was requested for this email.")
            
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role='ADMIN'
        )
        AdminVerificationCode.objects.filter(email=validated_data['email']).delete()
        return user


class RegisterSerializer(serializers.Serializer):
    # Core user fields
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=[(r, r) for r in ROLE_CHOICES])

    # Optional shop fields
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
        # Pop shop-specific data first.
        shop_name = validated_data.pop('shop_name', None)
        address = validated_data.pop('address', None)
        province = validated_data.pop('province', None)

        # --- THIS IS THE FIX ---
        # Pop the arguments that are passed explicitly to create_user
        password = validated_data.pop('password')
        email = validated_data.pop('email') # <-- This line was missing

        # The remaining validated_data (first_name, last_name, etc.) are passed as extra fields.
        user = User.objects.create_user(
            username=email,  # Use email as the username
            email=email,
            password=password,
            **validated_data
        )
        # --- END OF FIX ---

        # If the role is OWNER and a shop name was provided, create the shop.
        if user.role == 'OWNER' and shop_name:
            SpazaShop.objects.create(
                owner=user,
                name=shop_name,
                address=address,
                province=province,
                verified=False
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