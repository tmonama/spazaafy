import csv
from django.http import HttpResponse
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Document, DocumentStatus
from .serializers import DocumentSerializer
from apps.core.permissions import ProvinceScopedMixin
from django.utils import timezone
from apps.shops.models import SpazaShop
from rest_framework.exceptions import PermissionDenied
import sys
from rest_framework.parsers import MultiPartParser, FormParser
import traceback

class DocumentViewSet(ProvinceScopedMixin, viewsets.ModelViewSet):
    parser_classes = (MultiPartParser, FormParser)
    queryset = Document.objects.select_related('shop', 'verified_by')
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.is_staff and getattr(user, 'role', None) == 'ADMIN':
            return self.scope_by_province(qs, user)
        return qs.filter(shop__owner=user)
    
    def perform_create(self, serializer):
        """
        Robustly get the user's shop and associate it with the new document.
        This handles cases where a user might have zero or multiple shops.
        """
        print("--- DOCUMENT UPLOAD: Starting perform_create ---", file=sys.stderr) # Log Step 1
        user = self.request.user
        print(f"--- DOCUMENT UPLOAD: User is {user.email} ---", file=sys.stderr) # Log Step 2

        
        # Use .filter().first() instead of .get() to avoid crashing
        shop = SpazaShop.objects.filter(owner=user).first()
        
        # Now, explicitly check if a shop was found
        if not shop:
            print("--- DOCUMENT UPLOAD: FAILED - User does not own a shop. ---", file=sys.stderr) # Log Failure
            raise PermissionDenied("You do not own a shop and cannot upload documents.")
        print(f"--- DOCUMENT UPLOAD: Found shop '{shop.name}' (ID: {shop.id}) ---", file=sys.stderr) # Log Step 3
        # If we found a shop, save the document with the association
        try:
            serializer.save(shop=shop)
        except Exception:
            traceback.print_exc()
            raise
        print("--- DOCUMENT UPLOAD: serializer.save() completed successfully! ---", file=sys.stderr) # Log Success

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