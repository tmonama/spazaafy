from rest_framework import serializers
from .models import Document
class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id','shop','shop_name','type','file','status','notes','expiry_date','uploaded_at','verified_at','verified_by']
        read_only_fields = ['status','uploaded_at','verified_at','verified_by']
