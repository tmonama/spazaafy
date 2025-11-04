import csv
from django.http import HttpResponse
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SpazaShop, USE_GIS
from .serializers import SpazaShopSerializer
from apps.core.permissions import ProvinceScopedMixin

# ✅ 1. Import necessary modules for geocoding
from django.conf import settings
import googlemaps

class SpazaShopViewSet(ProvinceScopedMixin, viewsets.ModelViewSet):
    queryset = SpazaShop.objects.all()
    serializer_class = SpazaShopSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'nearby']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.is_authenticated:
            if user.is_staff and getattr(user, 'role', None) == 'ADMIN':
                return self.scope_by_province(qs, user)
            
            if getattr(user, 'role', None) == 'OWNER':
                return qs.filter(owner=user)
        
        return qs.filter(verified=True)



    @action(detail=False, methods=['get'])
    def nearby(self, request):
        try:
            lat = float(request.query_params.get('lat'))
            lng = float(request.query_params.get('lng'))
        except (TypeError, ValueError):
            return Response({'detail': 'lat and lng query parameters are required and must be numbers.'}, status=400)
        
        radius_km = float(request.query_params.get('radius_km', 25))
        qs = self.get_queryset()

        if USE_GIS:
            from django.contrib.gis.measure import D
            from django.contrib.gis.geos import Point
            pt = Point(lng, lat, srid=4326)
            qs = qs.filter(location__distance_lte=(pt, D(km=radius_km)))
            return Response(self.get_serializer(qs, many=True).data)
        
        within = []
        for s in qs.iterator():
            d = s.distance_km_from(lat, lng)
            if d is not None and d <= radius_km:
                within.append(s)
        return Response(self.get_serializer(within, many=True).data)
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="spaza_shops.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'Shop Name', 'Owner', 'Email', 'Address', 'Province', 'Verified'])
        for shop in self.get_queryset():
            writer.writerow([
                shop.id,
                shop.name,
                shop.owner.get_full_name() if shop.owner else 'N/A',
                shop.owner.email if shop.owner else 'N/A',
                shop.address,
                shop.province.name if shop.province else 'N/A',
                shop.verified
            ])
        return response