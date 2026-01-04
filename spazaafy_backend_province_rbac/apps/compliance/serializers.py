from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='get_type_display', read_only=True)
    fileUrl = serializers.URLField(source='file.url', read_only=True)
    
    # ✅ STRICT: Ensure location is required
    upload_lat = serializers.FloatField(
        required=True, 
        allow_null=False,
        error_messages={'required': 'Location data is missing. Please enable GPS.'}
    )
    upload_lng = serializers.FloatField(
        required=True, 
        allow_null=False,
        error_messages={'required': 'Location data is missing. Please enable GPS.'}
    )
    
    upload_accuracy = serializers.FloatField(required=False, allow_null=True)

    class Meta:
        model = Document
        fields = [
            'id', 'shop', 'shop_name', 'name', 'type', 'file', 'fileUrl', 
            'status', 'notes', 'expiry_date', 'uploaded_at', 'verified_at', 'verified_by',
            'upload_lat', 'upload_lng', 'upload_accuracy', 'rejection_reason'
        ]
        read_only_fields = ['shop', 'status', 'uploaded_at', 'verified_at', 'verified_by']
        extra_kwargs = {'file': {'write_only': True}}