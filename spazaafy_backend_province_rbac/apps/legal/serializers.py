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
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = LegalRequest
        fields = '__all__'

    def get_file_url(self, obj):
        # ✅ Safety Check: Only try to get URL if file exists and has a name
        try:
            if obj.document_file and hasattr(obj.document_file, 'name') and obj.document_file.name:
                return obj.document_file.url
        except Exception as e:
            print(f"Error generating URL for LegalRequest {obj.id}: {e}")
            return None
        return None