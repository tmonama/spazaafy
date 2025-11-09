from rest_framework import serializers
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Ticket, Message

User = get_user_model()

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role']

class TicketSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)

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
            'shopName'
        ]

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['ticket', 'sender', 'created_at']