from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Ticket, Message
from .serializers import TicketSerializer, MessageSerializer
from apps.core.permissions import ProvinceScopedMixin
from .models import mark_ticket_as_read # ✅ 1. Import the new function
from apps.shops.models import SpazaShop

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
        user = self.request.user
        user_province = getattr(user, 'province', None)
        
        # Find the user's shop, if they are a shop owner
        user_shop = SpazaShop.objects.filter(owner=user).first()
        
        serializer.save(user=user, province=user_province, shop=user_shop)

    # ✅ 2. Add this custom retrieve method
    def retrieve(self, request, *args, **kwargs):
        """
        Custom retrieve action that marks the ticket as read for the user viewing it.
        """
        instance = self.get_object()
        
        # Call our new function to mark the ticket as read
        mark_ticket_as_read(instance, request.user)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ticket_id = self.kwargs.get('ticket_pk')
        return Message.objects.filter(ticket_id=ticket_id)

    def perform_create(self, serializer):
        ticket_id = self.kwargs.get('ticket_pk')
        serializer.save(ticket_id=ticket_id, sender=self.request.user)