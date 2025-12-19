from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    fileUrl = serializers.URLField(source='file.url', read_only=True)
    
    # Explicitly define these to ensure they are accepted as input but optional
    upload_lat = serializers.FloatField(required=False, allow_null=True)
    upload_lng = serializers.FloatField(required=False, allow_null=True)
    upload_accuracy = serializers.FloatField(required=False, allow_null=True)


    class Meta:
        model = Document
        fields = [
            'id',
            'shop',
            'shop_name',
            'name',
            'type',
            'file',
            'fileUrl',
            'status',
            'notes',
            'expiry_date',
            'uploaded_at',
            'verified_at',
            'verified_by',
            # New fields
            'upload_lat',
            'upload_lng',
            'upload_accuracy'
        ]
        read_only_fields = ['shop', 'status', 'uploaded_at', 'verified_at', 'verified_by']
        
        extra_kwargs = {
            'file': {'write_only': True}
        }