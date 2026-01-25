from rest_framework import serializers
from .models import Province, Campaign, EmailTemplate

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

    