from rest_framework import viewsets, permissions
from .models import Ticket, Message
from .serializers import TicketSerializer, MessageSerializer
from apps.core.permissions import ProvinceScopedMixin

class TicketViewSet(ProvinceScopedMixin, viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

    def get_permissions(self):
        if self.action in ['create','list','retrieve']: return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        u = self.request.user
        if u.is_staff and getattr(u,'role',None)=='ADMIN':
            return self.scope_by_province(Ticket.objects.all(), u)
        return Ticket.objects.filter(user=u)

    def perform_create(self, serializer):
        user_province = getattr(self.request.user, 'province', None)
        serializer.save(user=self.request.user, province=user_province)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ticket_id = self.kwargs.get('ticket_pk')
        return Message.objects.filter(ticket_id=ticket_id)

    def perform_create(self, serializer):
        ticket_id = self.kwargs.get('ticket_pk')
        serializer.save(ticket_id=ticket_id, sender=self.request.user)