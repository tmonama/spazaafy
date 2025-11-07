from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    # This field will be created manually in the method below.
    # It ensures DRF's schema generation knows about it.
    fileUrl = serializers.URLField(read_only=True, source='file.url') 

    class Meta:
        model = Document
        # The 'file' field is kept here so it can be used for uploads.
        fields = [
            'id',
            'shop',
            'shop_name',
            'type',
            'file', 
            'fileUrl', # Add the new field name here
            'status',
            'notes',
            'expiry_date',
            'uploaded_at',
            'verified_at',
            'verified_by'
        ]
        read_only_fields = ['shop', 'status','uploaded_at','verified_at','verified_by']
        # Make the original 'file' field write-only. This is critical.
        # It means it's used for uploads but HIDDEN from the final JSON response.
        extra_kwargs = {
            'file': {'write_only': True}
        }

    def to_representation(self, instance):
        """
        ✅ THIS IS THE GUARANTEED FIX.
        This method lets us manually build the JSON response dictionary.
        We explicitly get the clean S3 URL from `instance.file.url` and
        assign it to a field named `fileUrl`, which the frontend will use.
        This completely bypasses DRF's broken URL generation.
        """
        # Get the default serialized data dictionary
        representation = super().to_representation(instance)
        
        # Manually add the correct URL to the response if the file exists
        if hasattr(instance, 'file') and instance.file:
            representation['fileUrl'] = instance.file.url
            
        return representation