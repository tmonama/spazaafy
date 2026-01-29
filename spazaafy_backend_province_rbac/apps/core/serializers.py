from rest_framework import serializers
from .models import Province, Campaign, EmailTemplate, SystemComponent, SystemIncident

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
    