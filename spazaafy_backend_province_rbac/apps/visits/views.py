from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SiteVisit, SiteVisitForm
from .serializers import SiteVisitSerializer, AssignInspectorSerializer, StatusUpdateSerializer, SiteVisitFormSerializer
from apps.core.permissions import ProvinceScopedMixin

class SiteVisitViewSet(ProvinceScopedMixin, viewsets.ModelViewSet):
    queryset = SiteVisit.objects.select_related('shop','requested_by','inspector')
    serializer_class = SiteVisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    def get_queryset(self):
        u = self.request.user
        if u.is_staff and getattr(u,'role',None)=='ADMIN':
            return self.scope_by_province(self.queryset, u)
        return self.queryset.filter(shop__owner=u) | self.queryset.filter(requested_by=u)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def assign(self, request, pk=None):
        v = self.get_object()
        s = AssignInspectorSerializer(data=request.data); s.is_valid(raise_exception=True)
        v.inspector_id = s.validated_data['inspector_id']; v.save()
        return Response(SiteVisitSerializer(v).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def status(self, request, pk=None):
        v = self.get_object()
        s = StatusUpdateSerializer(data=request.data); s.is_valid(raise_exception=True)
        v.status = s.validated_data['status']; v.save()
        return Response(SiteVisitSerializer(v).data)

class SiteVisitFormViewSet(ProvinceScopedMixin, viewsets.ModelViewSet):
    queryset = SiteVisitForm.objects.select_related('visit','visit__shop')
    serializer_class = SiteVisitFormSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        if u.is_staff and getattr(u,'role',None)=='ADMIN':
            return self.scope_by_province(self.queryset, u)
        return self.queryset.filter(visit__shop__owner=u) | self.queryset.filter(visit__requested_by=u)
