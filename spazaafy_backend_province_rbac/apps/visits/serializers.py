from rest_framework import serializers
from .models import SiteVisit, SiteVisitForm

class SiteVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteVisit
        fields = ['id','shop','requested_by','inspector','requested_datetime','status','admin_notes','created_at','updated_at', 'share_code', 'share_code_expires_at']
        read_only_fields = ['requested_by','created_at','updated_at',  'share_code', 'share_code_expires_at']

class SiteVisitFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteVisitForm
        # ✅ ADD ALL THE NEW FIELDS TO THIS LIST
        fields = [
            'id', 'visit', 
            'inspector_name', 'inspector_surname', 'contractor_company',
            'cleanliness', 'stock_rotation_observed', 
            'fire_extinguisher_valid', 'business_licence_displayed', 
            'health_certificate_displayed', 'inspector_notes', 'submitted_at',
            'refund_policy_visible', 'sales_record_present', 'inventory_system_in_place',
            'food_labels_and_expiry_present', 'prices_visible', 'notices_policies_displayed',
            'supplier_list_present', 'building_plan_present', 'adequate_ventilation',
            'healthy_storage_goods'
        ]
        read_only_fields = ['requested_by','created_at','updated_at', 'share_code', 'share_code_expires_at']