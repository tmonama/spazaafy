from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    # ✅ FIX 1: Add a read-only field that gets the correct URL directly from S3.
    # This will be included in API responses for the frontend to use.
    file_url = serializers.URLField(source='file.url', read_only=True)

    class Meta:
        model = Document
        # ✅ FIX 2: Add 'file_url' to the list of fields.
        fields = [
            'id',
            'shop',
            'shop_name',
            'type',
            'file',       # This is kept for uploads
            'file_url',   # This is added for viewing
            'status',
            'notes',
            'expiry_date',
            'uploaded_at',
            'verified_at',
            'verified_by'
        ]
        read_only_fields = ['shop', 'status','uploaded_at','verified_at','verified_by']
        
        # ✅ FIX 3: Make the original 'file' field write-only.
        # This means it's used when you upload a file, but it's hidden from the API response,
        # preventing the bad URL from being generated.
        extra_kwargs = {
            'file': {'write_only': True}
        }