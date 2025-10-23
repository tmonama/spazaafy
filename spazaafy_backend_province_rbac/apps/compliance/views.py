from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Document, DocumentStatus
from .serializers import DocumentSerializer
from apps.core.permissions import ProvinceScopedMixin

class DocumentViewSet(ProvinceScopedMixin, viewsets.ModelViewSet):
    queryset = Document.objects.select_related('shop','verified_by')
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = super().get_queryset()
        if u.is_staff and getattr(u,'role',None)=='ADMIN':
            return self.scope_by_province(qs, u)
        return qs.filter(shop__owner=u)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        doc = self.get_object()
        action_ = request.data.get('action'); notes = request.data.get('notes',"")
        if action_ == 'verify':
            doc.mark_verified(request.user)
        else:
            doc.status = DocumentStatus.REJECTED; doc.notes = notes; doc.verified_by = request.user; doc.save()
        return Response(DocumentSerializer(doc).data)
