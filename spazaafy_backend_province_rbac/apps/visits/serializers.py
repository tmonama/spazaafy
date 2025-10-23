from rest_framework import serializers
from .models import SiteVisit, SiteVisitForm

class SiteVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteVisit
        fields = ['id','shop','requested_by','inspector','requested_datetime','status','admin_notes','created_at','updated_at']
        read_only_fields = ['requested_by','created_at','updated_at']

class AssignInspectorSerializer(serializers.Serializer):
    inspector_id = serializers.IntegerField()

class StatusUpdateSerializer(serializers.Serializer):
    status = serializers.CharField()

class SiteVisitFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteVisitForm
        fields = ['id','visit','cleanliness','stock_rotation_observed','fire_extinguisher_valid','business_licence_displayed','health_certificate_displayed','inspector_notes','submitted_at']
        read_only_fields = ['submitted_at']
