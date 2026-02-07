from rest_framework import serializers
from .models import Province, Campaign, EmailTemplate, SystemComponent, SystemIncident, AccessLog, AccessRevocationRequest

class SystemComponentSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    class Meta:
        model = SystemComponent
        fields = '__all__'

class SystemIncidentSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    class Meta:
        model = SystemIncident
        fields = '__all__'

class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = ['id', 'name']

class CampaignSerializer(serializers.ModelSerializer):
    template_count = serializers.IntegerField(source='templates.count', read_only=True)
    class Meta:
        model = Campaign
        fields = '__all__'

class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = '__all__'

class AccessLogSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    is_suspended = serializers.BooleanField(source='user.is_active', read_only=True) # Note: is_active=False means suspended

    class Meta:
        model = AccessLog
        fields = ['id', 'email', 'name', 'role_granted', 'granted_at', 'is_suspended']

class AccessRevocationRequestSerializer(serializers.ModelSerializer):
    target_user_email = serializers.CharField(source='target_user.email', read_only=True)
    requested_by_email = serializers.CharField(source='requested_by.email', read_only=True)

    class Meta:
        model = AccessRevocationRequest
        fields = '__all__'