from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    # This now works perfectly because `file.url` will generate a pre-signed URL.
    fileUrl = serializers.URLField(source='file.url', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id',
            'shop',
            'shop_name',
            'type',
            'file',       # Kept for uploads
            'fileUrl',    # Used for viewing
            'status',
            'notes',
            'expiry_date',
            'uploaded_at',
            'verified_at',
            'verified_by'
        ]
        read_only_fields = ['shop', 'status','uploaded_at','verified_at','verified_by']
        
        # Hides the original 'file' field from the API response to avoid confusion.
        extra_kwargs = {
            'file': {'write_only': True}
        }