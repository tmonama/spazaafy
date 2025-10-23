# apps/accounts/serializers.py

from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# Keep these in sync with the frontend (it sends 'CONSUMER' / 'OWNER' / 'ADMIN')
ROLE_CHOICES = ('CONSUMER', 'OWNER', 'ADMIN')


class RegisterSerializer(serializers.Serializer):
    # Core user fields
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=[(r, r) for r in ROLE_CHOICES])

    # Optional shop fields (used when role == OWNER)
    shop_name = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    province = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def _generate_unique_username(self, email: str) -> str:
        """
        Generate a unique username from the email local-part.
        This avoids IntegrityError on accounts_user.username unique constraint.
        """
        base = (email.split('@')[0] or 'user').lower()
        candidate = base
        i = 1
        while User.objects.filter(username=candidate).exists():
            candidate = f"{base}{i}"
            i += 1
        return candidate

    def create(self, validated_data):
        role = validated_data.pop('role')
        shop_name = (validated_data.pop('shop_name', '') or '').strip()
        address = (validated_data.pop('address', '') or '').strip()
        province = (validated_data.pop('province', '') or '').strip()

        raw_password = validated_data.pop('password')
        email = validated_data.get('email', '').strip().lower()

        # Instantiate user and set required fields explicitly
        user = User(**validated_data)

        # If your User model still has a unique 'username' (AbstractUser-based),
        # set a unique value derived from email to prevent duplicate '' inserts.
        if hasattr(user, 'username'):
            user.username = self._generate_unique_username(email)

        # Persist role if the model has it
        if hasattr(user, 'role'):
            setattr(user, 'role', role)

        user.setPassword = getattr(user, "set_password", None)
        if callable(user.setPassword):
            user.set_password(raw_password)
        else:
            # Fallback (shouldn't happen): store raw (NOT recommended)
            raise ValidationError("User model missing set_password implementation.")

        user.save()

        # If registering an OWNER and a shop name was provided, create the shop record.
        if role == 'OWNER' and shop_name:
            try:
                from apps.shops.models import SpazaShop  # if app is namespaced under apps/
            except Exception:
                # Fallback in case app is registered simply as 'shops'
                from shops.models import SpazaShop

            # Ensure your SpazaShop model has these fields or adjust as needed.
            SpazaShop.objects.create(
                name=shop_name,
                address=address,
                province=province,
                owner=user,        # owner = models.ForeignKey(settings.AUTH_USER_MODEL, ...)
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


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        password = attrs.get("password")

        # If you configured an email auth backend, this will work:
        user = authenticate(request=self.context.get('request'), email=email, password=password)

        if not user:
            # Fallback: look up by email and check_password
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
