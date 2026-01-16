from rest_framework import serializers
from .models import LegalRequest

class LegalRequestPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalRequest
        fields = [
            'submitter_name', 'submitter_email', 'department', 
            'category', 'urgency', 'title', 'description', 'document_file'
        ]

class LegalRequestAdminSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    urgency_label = serializers.CharField(source='get_urgency_display', read_only=True)
    category_label = serializers.CharField(source='get_category_display', read_only=True)
    file_url = serializers.URLField(source='document_file.url', read_only=True)

    class Meta:
        model = LegalRequest
        fields = '__all__'