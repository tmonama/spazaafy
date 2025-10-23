from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SpazaShop, USE_GIS
from .serializers import SpazaShopSerializer
from apps.core.permissions import ProvinceScopedMixin

class SpazaShopViewSet(ProvinceScopedMixin, viewsets.ModelViewSet):
    queryset = SpazaShop.objects.all()
    serializer_class = SpazaShopSerializer

    def get_permissions(self):
        if self.action in ['list','retrieve','nearby']: return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action in ['list','retrieve','nearby']:
            return qs.filter(verified=True)
        if self.request.user.is_authenticated and self.request.user.is_staff and getattr(self.request.user,'role',None)=='ADMIN':
            return self.scope_by_province(qs, self.request.user)
        if self.request.user.is_authenticated:
            return qs.filter(owner=self.request.user)
        return qs.none()

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        try:
            lat = float(request.query_params.get('lat')); lng = float(request.query_params.get('lng'))
        except: return Response({'detail':'lat and lng required'}, status=400)
        radius_km = float(request.query_params.get('radius_km', 25))
        if USE_GIS:
            from django.contrib.gis.measure import D
            from django.contrib.gis.geos import Point
            pt = Point(lng, lat, srid=4326)
            qs = SpazaShop.objects.filter(verified=True, location__distance_lte=(pt, D(km=radius_km)))
            return Response(self.get_serializer(qs, many=True).data)
        within = []
        for s in SpazaShop.objects.filter(verified=True).iterator():
            d = s.distance_km_from(lat,lng)
            if d is not None and d <= radius_km: within.append(s)
        return Response(self.get_serializer(within, many=True).data)
