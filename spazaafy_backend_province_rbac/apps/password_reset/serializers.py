# apps/password_reset/serializers.py

from rest_framework import serializers

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(
        label="Email Address",
        write_only=True
    )

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.UUIDField(write_only=True)
    password = serializers.CharField(
        label="New Password",
        style={'input_type': 'password'},
        write_only=True,
        min_length=8
    )
    password_confirm = serializers.CharField(
        label="Confirm New Password",
        style={'input_type': 'password'},
        write_only=True
    )

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "The two password fields didn't match."})
        return data