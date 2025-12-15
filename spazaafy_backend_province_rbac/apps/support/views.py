from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from .models import Ticket, Message
from .serializers import TicketSerializer, MessageSerializer, AssistanceRequestSerializer
from apps.core.permissions import ProvinceScopedMixin
from .models import mark_ticket_as_read # ✅ 1. Import the new function
from apps.shops.models import SpazaShop
from django.core.mail import EmailMessage
from django.conf import settings

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


class RequestAssistanceView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AssistanceRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        data = serializer.validated_data

        # Fetch Shop Details
        try:
            shop = SpazaShop.objects.get(owner=user)
            shop_name = shop.name
            shop_address = shop.address
        except SpazaShop.DoesNotExist:
            return Response(
                {"detail": "Only registered Shop Owners can request assistance."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Construct Email
        subject = f"Assistance Request: {shop_name} ({user.get_full_name()})"
        
        # Human readable assistance type
        assistance_label = dict(serializer.ASSISTANCE_TYPES).get(data['assistance_type'], data['assistance_type'])

        body = f"""
        New Assistance Request from Spazaafy Platform

        --- USER & SHOP DETAILS ---
        Owner Name: {user.get_full_name()}
        Email: {user.email}
        Phone: {user.phone}
        
        Shop Name: {shop_name}
        Address: {shop_address}

        --- REQUEST DETAILS ---
        Assistance Needed: {assistance_label}
        
        User Comments: 
        {data['comments']}

        --- CONSENT ---
        User has consented to share this profile information with third-party partners: YES
        """

        try:
            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=['spazaafy@gmail.com'],
                reply_to=[user.email]
            )
            email.send()
        except Exception as e:
            print(f"Error sending assistance email: {e}")
            return Response(
                {"detail": "Failed to send request. Please try again later."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({"detail": "Assistance request sent successfully."}, status=status.HTTP_200_OK)