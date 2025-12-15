from rest_framework import serializers
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Ticket, Message, AssistanceRequest 

User = get_user_model()

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role']

class TicketSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    shopName = serializers.CharField(source='shop.name', read_only=True, allow_null=True)

    class Meta:
        model = Ticket
        # ✅ Add the new fields to the serializer's output
        fields = [
            'id', 
            'user', 
            'title', 
            'description', 
            'status', 
            'priority',  
            'created_at', 
            'updated_at',
            'unread_for_creator',   # <-- ADD THIS
            'unread_for_assignee',  # <-- ADD THIS
            'shop',
            'shopName'
        ]

        extra_kwargs = {
            'shop': {'write_only': True}
        }

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['ticket', 'sender', 'created_at']


class AssistanceRequestSerializer(serializers.Serializer):
    ASSISTANCE_TYPES = [
        ("CIPC_REGISTRATION", "CIPC Registration"),
        ("SARS_TAX_CLEARANCE", "SARS Tax Clearance"),
        ("HEALTH_CERTIFICATE", "Health Certificate (COA)"),
        ("TRADING_LICENSE", "Trading License"),
        ("ZONING_PERMIT", "Zoning Permit"),
        ("OTHER", "Other"),
    ]

    assistance_type = serializers.ChoiceField(choices=ASSISTANCE_TYPES)
    comments = serializers.CharField(min_length=5, label="Additional Comments")
    consent = serializers.BooleanField()

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError("You must agree to share your profile with partners to proceed.")
        return value
    
class AssistanceRequestModelSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True) # Reuse your user serializer
    class Meta:
        model = AssistanceRequest
        fields = '__all__'