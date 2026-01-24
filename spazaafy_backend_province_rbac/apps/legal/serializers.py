from rest_framework import serializers
from .models import LegalRequest, LegalCategory, LegalUrgency, LegalStatus

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

    category = serializers.ChoiceField(choices=LegalCategory.choices)
    urgency = serializers.ChoiceField(choices=LegalUrgency.choices)
    status = serializers.ChoiceField(choices=LegalStatus.choices)

    # ✅ FIX: Use SerializerMethodField to get the S3 URL safely
    # We display the LATEST file (Revision if exists, else Original)
    file_url = serializers.SerializerMethodField()
    is_revised = serializers.SerializerMethodField()

    class Meta:
        model = LegalRequest
        fields = '__all__'

    def get_file_url(self, obj):
        try:
            # ✅ Prefer Revision File if it exists
            if obj.revision_file and hasattr(obj.revision_file, 'url'):
                return obj.revision_file.url
            if obj.document_file and hasattr(obj.document_file, 'url'):
                return obj.document_file.url
        except:
            return None
        return None

    def get_is_revised(self, obj):
        return bool(obj.revision_file)

# ✅ NEW Serializer for the Amendment Upload
class AmendmentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalRequest
        fields = ['revision_file']