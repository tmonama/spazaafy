from rest_framework import serializers
from .models import SpazaShop

class SpazaShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpazaShop
        fields = ['id','name','address','province','verified','owner','created_at','latitude','longitude'] if hasattr(SpazaShop,'latitude') else ['id','name','address','province','verified','owner','created_at','location']
        read_only_fields = ['owner','verified','created_at']

    def create(self, validated_data):
        req = self.context['request']
        validated_data['owner'] = req.user
        if getattr(req.user,'role',None)=='ADMIN' and getattr(req.user,'province_id',None):
            validated_data['province_id'] = req.user.province_id
        return super().create(validated_data)
