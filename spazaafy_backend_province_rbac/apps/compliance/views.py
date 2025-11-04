import csv
from django.http import HttpResponse
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Document, DocumentStatus
from .serializers import DocumentSerializer
from apps.core.permissions import ProvinceScopedMixin
from django.utils import timezone

class DocumentViewSet(ProvinceScopedMixin, viewsets.ModelViewSet):
    queryset = Document.objects.select_related('shop', 'verified_by')
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.is_staff and getattr(user, 'role', None) == 'ADMIN':
            return self.scope_by_province(qs, user)
        return qs.filter(shop__owner=user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        doc = self.get_object()
        
        # Directly set status and other fields
        doc.status = DocumentStatus.VERIFIED
        doc.verified_at = timezone.now()
        doc.verified_by = request.user
        doc.notes = request.data.get('notes', 'Admin approved.')
        
        # ✅ THE FIX: Get the expiry date from the request body and save it
        expiry_date = request.data.get('expiry_date', None)
        if expiry_date:
            doc.expiry_date = expiry_date
        
        doc.save()
        
        # Now, check if the shop itself should be verified
        if hasattr(doc.shop, 'check_and_update_verification'):
            doc.shop.check_and_update_verification()

        return Response(DocumentSerializer(doc).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        doc = self.get_object()
        doc.status = DocumentStatus.REJECTED
        doc.notes = request.data.get('notes', 'Admin rejected.')
        doc.verified_by = request.user
        doc.save()
        
        # Also check verification status after a rejection
        if hasattr(doc.shop, 'check_and_update_verification'):
            doc.shop.check_and_update_verification()
            
        return Response(DocumentSerializer(doc).data)
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="documents.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'Shop Name', 'Document Type', 'Status', 'Submitted At', 'Expiry Date'])
        for doc in self.get_queryset():
            writer.writerow([
                doc.id, doc.shop.name, doc.get_type_display(),
                doc.get_status_display(), doc.uploaded_at, doc.expiry_date
            ])
        return response