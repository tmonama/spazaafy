from rest_framework import viewsets, permissions
from .models import Province
from .serializers import ProvinceSerializer

class ProvinceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for viewing Provinces.
    """
    queryset = Province.objects.all().order_by('name')
    serializer_class = ProvinceSerializer
    permission_classes = [permissions.AllowAny]