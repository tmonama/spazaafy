from rest_framework import serializers
from django.conf import settings
# ✅ 1. Import the correct function
from django.contrib.auth import get_user_model
from .models import Ticket, Message

# ✅ 2. Call the function to get the actual User model class
User = get_user_model()

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        # ✅ 3. Now, 'User' is a proper model class, and this will work
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role']

class TicketSerializer(serializers.ModelSerializer):
    # This field name must match the field on the Ticket model
    user = SimpleUserSerializer(read_only=True)

    class Meta:
        model = Ticket
        # Ensure the fields list matches the model and the custom field above
        fields = [
            'id', 
            'user', 
            'title', 
            'description', 
            'status', 
            'priority',  
            'created_at', 
            'updated_at',
        ]

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['ticket', 'sender', 'created_at']