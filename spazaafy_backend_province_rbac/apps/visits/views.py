import csv
import uuid 
from datetime import timedelta
from django.utils import timezone
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import SiteVisit, SiteVisitForm, SiteVisitStatus
from .serializers import SiteVisitSerializer, SiteVisitFormSerializer
from apps.core.permissions import ProvinceScopedMixin


class SiteVisitViewSet(ProvinceScopedMixin, viewsets.ModelViewSet):
    queryset = SiteVisit.objects.select_related('shop', 'requested_by', 'inspector')
    serializer_class = SiteVisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    # ✅ ADD THIS METHOD TO THE CLASS
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        # Allow unauthenticated access to the 'retrieve' action (e.g., GET /api/visits/8/)
        if self.action == 'retrieve':
            return [permissions.AllowAny()]
        
        # For all other actions, use the default permissions (IsAuthenticated)
        return super().get_permissions()


    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        # ✅ THE FIX: If the user is not logged in (i.e., this is a public request for the retrieve action),
        # don't apply any user-based filtering. The framework will handle fetching by the primary key.
        if not user.is_authenticated:
            return qs

        if user.is_staff and getattr(user, 'role', None) == 'ADMIN':
            # ✅ THE FIX: If the user is a superuser, show them everything.
            if user.is_superuser:
                return qs
            # Otherwise, for a regular admin, filter by their province.
            return self.scope_by_province(qs, user)
        
        # For non-admins (shop owners), only show their own visits.
        return qs.filter(shop__owner=user) | qs.filter(requested_by=user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def assign(self, request, pk=None):
        # Placeholder for future "assign inspector" logic
        pass

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def status(self, request, pk=None):
        visit = self.get_object()
        new_status = request.data.get('status')
        if new_status in SiteVisitStatus.values:
            visit.status = new_status
            visit.save()
            return Response(SiteVisitSerializer(visit).data)
        return Response({'detail': 'Invalid status provided.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # ✅ THIS IS THE CORRECTED EXPORT FUNCTION FOR VISITS
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="site_visits.csv"'
        writer = csv.writer(response)
        
        # Correct headers for visits
        writer.writerow(['ID', 'Shop Name', 'Status', 'Requested Date', 'Inspector'])
        
        # Correct fields for each visit object
        for visit in self.get_queryset():
            writer.writerow([
                visit.id,
                visit.shop.name if visit.shop else 'N/A',
                visit.get_status_display(),
                visit.requested_datetime.strftime('%Y-%m-%d %H:%M'),
                visit.inspector.get_full_name() if visit.inspector else 'Not Assigned'
            ])
        return response
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def generate_share_code(self, request, pk=None):
        visit = self.get_object()
        
        # Generate a short, unique code (e.g., first 8 chars of a UUID)
        new_code = str(uuid.uuid4()).upper().replace('-', '')[:8]
        
        # Set expiry to 24 hours from now
        expiry_time = timezone.now() + timedelta(hours=24)
        
        visit.share_code = new_code
        visit.share_code_expires_at = expiry_time
        visit.save()
        
        # Return the updated visit object (includes the new code and expiry)
        return Response(SiteVisitSerializer(visit, context={'request': request}).data)

# ✅ THE FIX: Ensure this inherits from the full ModelViewSet, not ReadOnly
class SiteVisitFormViewSet(ProvinceScopedMixin, viewsets.ModelViewSet):
    queryset = SiteVisitForm.objects.all().select_related('visit', 'visit__shop')
    serializer_class = SiteVisitFormSerializer
    permission_classes = [permissions.IsAuthenticated]

    filterset_fields = ['visit']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff and getattr(user, 'role', None) == 'ADMIN':
            return self.scope_by_province(self.queryset, user)
        return self.queryset.filter(visit__shop__owner=user) | self.queryset.filter(visit__requested_by=user)
    
    
     # ✅ ADD THIS METHOD
    def get_permissions(self):
        # Allow any user (authenticated or not) to create a form.
        if self.action == 'create':
            return [permissions.AllowAny()]
        
        # For all other actions (list, update, delete), require authentication.
        return super().get_permissions()
