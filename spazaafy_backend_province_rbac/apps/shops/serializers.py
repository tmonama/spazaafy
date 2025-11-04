from rest_framework import serializers
from .models import SpazaShop, Province

# This is a dependency for the SpazaShopSerializer
class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = ('id', 'name')

class SpazaShopSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='owner.first_name', read_only=True)
    last_name = serializers.CharField(source='owner.last_name', read_only=True)
    phone = serializers.CharField(source='owner.phone', read_only=True)
    email = serializers.EmailField(source='owner.email', read_only=True)
    
    # These fields are for writing data to the backend.
    latitude = serializers.FloatField(write_only=True, required=False)
    longitude = serializers.FloatField(write_only=True, required=False)

    province = ProvinceSerializer(read_only=True)
    province_id = serializers.PrimaryKeyRelatedField(
        queryset=Province.objects.all(), source='province', write_only=True
    )

    class Meta:
        model = SpazaShop
        fields = [
            'id',
            'owner', 
            'name',
            'address',
            'verified',
            'province',
            'province_id',
            'first_name',
            'last_name',
            'phone',
            'email',
            'location', # This field provides location data to the frontend
            'created_at',
            'latitude', # This field accepts latitude on updates
            'longitude', # This field accepts longitude on updates
        ]
        read_only_fields = ['owner', 'verified', 'created_at', 'location']

        # ✅ FIX: Removed the incorrect read_only constraints
        extra_kwargs = {}

    # ✅ FIX: Moved the update method to the correct indentation level
    def update(self, instance, validated_data):
        latitude = validated_data.pop('latitude', None)
        longitude = validated_data.pop('longitude', None)

        if latitude is not None and longitude is not None:
            from django.contrib.gis.geos import Point
            # Note: A Point object takes longitude first, then latitude.
            instance.location = Point(longitude, latitude, srid=4326)

        return super().update(instance, validated_data)