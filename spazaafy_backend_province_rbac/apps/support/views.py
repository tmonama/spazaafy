from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from .models import Ticket, Message, AssistanceRequest
from .serializers import TicketSerializer, MessageSerializer, AssistanceRequestSerializer, AssistanceRequestModelSerializer
from apps.core.permissions import ProvinceScopedMixin
from .models import mark_ticket_as_read
from apps.shops.models import SpazaShop
from django.core.mail import EmailMessage
from django.conf import settings
from rest_framework.decorators import action

# ... TicketViewSet and MessageViewSet remain unchanged ...
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
        user_shop = SpazaShop.objects.filter(owner=user).first()
        serializer.save(user=user, province=user_province, shop=user_shop)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
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


# ✅ UPDATED VIEW
class RequestAssistanceView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AssistanceRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        data = serializer.validated_data

        # 1. Fetch Shop Details First
        try:
            shop = SpazaShop.objects.get(owner=user)
            shop_name = shop.name
            shop_address = shop.address
        except SpazaShop.DoesNotExist:
            return Response(
                {"detail": "Only registered Shop Owners can request assistance."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Create DB Entry
        assistance_req = AssistanceRequest.objects.create(
            user=user,
            shop_name=shop_name,
            assistance_type=data['assistance_type'],
            comments=data['comments']
        )

        assistance_label = dict(serializer.ASSISTANCE_TYPES).get(data['assistance_type'], data['assistance_type'])

        # ---------------------------------------------------------
        # EMAIL 1: TO ADMIN (The Lead)
        # ---------------------------------------------------------
        admin_subject = f"[{assistance_req.reference_code}] New Lead: {shop_name}"
        admin_body = f"""
        NEW LEAD GENERATED
        --------------------------------------------------
        REFERENCE CODE: {assistance_req.reference_code}
        (Quote this code to partners for commission tracking)
        --------------------------------------------------

        CLIENT DETAILS:
        Name: {user.get_full_name()}
        Shop: {shop_name}
        Email: {user.email}
        Phone: {user.phone}
        Address: {shop_address}

        REQUEST:
        Service: {assistance_label}
        Notes: {data['comments']}

        STATUS: Pending
        """

        # ---------------------------------------------------------
        # EMAIL 2: TO SHOP OWNER (Confirmation)
        # ---------------------------------------------------------
        user_subject = f"Assistance Request Received: {assistance_req.reference_code}"
        user_body = f"""
        Dear {user.first_name},

        Thank you for reaching out to Spazaafy. We have received your request for business assistance.

        --------------------------------------------------
        YOUR REFERENCE NUMBER: {assistance_req.reference_code}
        --------------------------------------------------

        Service Requested: {assistance_label}

        What happens next?
        We have forwarded your details to our verified compliance partners. 
        They will contact you shortly (via email or phone) to discuss the requirements and costs for this service.

        Please quote your Reference Number ({assistance_req.reference_code}) when speaking with them.

        Kind Regards,
        The Spazaafy Team
        """

        # Send both emails
        try:
            # 1. Send to Admin
            email_to_admin = EmailMessage(
                subject=admin_subject,
                body=admin_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=['spazaafy@gmail.com'], 
                reply_to=[user.email]
            )
            email_to_admin.send()

            # 2. Send to User
            email_to_user = EmailMessage(
                subject=user_subject,
                body=user_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email]
            )
            email_to_user.send()

        except Exception as e:
            print(f"Error sending assistance emails: {e}")
            # We don't return an error to the frontend because the DB record was saved successfully.

        return Response({
            "detail": "Assistance request sent successfully.",
            "reference_code": assistance_req.reference_code 
        }, status=status.HTTP_200_OK)
    

class AdminAssistanceViewSet(viewsets.ModelViewSet):
    queryset = AssistanceRequest.objects.all()
    serializer_class = AssistanceRequestModelSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['post'])
    def refer(self, request):
        ids = request.data.get('ids', [])
        partner_name = request.data.get('partner_name')
        partner_email = request.data.get('partner_email')

        if not ids or not partner_name or not partner_email:
            return Response({"detail": "Missing data."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Fetch requests
        requests_to_refer = AssistanceRequest.objects.filter(id__in=ids)
        
        # 2. Construct Email to Partner (CSV style or List)
        lead_details = ""
        for req in requests_to_refer:
            lead_details += f"""
            - REF: {req.reference_code}
              Service: {req.assistance_type}
              Shop: {req.shop_name}
              Owner: {req.user.get_full_name()} ({req.user.email}, {req.user.phone})
              Notes: {req.comments}
            ---------------------------------------------
            """

        email_body = f"""
        Dear {partner_name},

        Please find below {requests_to_refer.count()} new lead(s) referred by Spazaafy.
        
        IMPORTANT: Please quote the REF number in all invoices and commission statements.

        {lead_details}

        Regards,
        Spazaafy Admin Team
        """

        # 3. Send Email
        try:
            email = EmailMessage(
                subject=f"New Referrals from Spazaafy ({requests_to_refer.count()} Leads)",
                body=email_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[partner_email]
            )
            email.send()
        except Exception:
            return Response({"detail": "Failed to email partner."}, status=500)

        # 4. Update Status to REFERRED
        requests_to_refer.update(status='REFERRED')

        return Response({"detail": "Referrals sent successfully."}, status=200)

    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        ids = request.data.get('ids', [])
        new_status = request.data.get('status')
        # ✅ Capture the reason
        cancellation_reason = request.data.get('cancellation_reason', '')

        if not ids or not new_status:
            return Response({"detail": "Missing IDs or Status."}, status=status.HTTP_400_BAD_REQUEST)

        valid_statuses = [s[0] for s in AssistanceRequest.STATUS_CHOICES]
        if new_status not in valid_statuses:
             return Response({"detail": "Invalid status code."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Update the Database
        updated_count = AssistanceRequest.objects.filter(id__in=ids).update(status=new_status)

        # 2. SEND CANCELLATION EMAIL (If status is CANCELLED)
        if new_status == 'CANCELLED':
            requests_to_cancel = AssistanceRequest.objects.filter(id__in=ids)
            for req in requests_to_cancel:
                try:
                    subject = f"Update on Request {req.reference_code}: Cancelled"
                    body = f"""
                    Dear {req.user.first_name},

                    Your request for assistance regarding "{req.assistance_type}" (Ref: {req.reference_code}) has been CANCELLED.

                    Reason for cancellation:
                    --------------------------------------------------
                    {cancellation_reason or "No specific reason provided."}
                    --------------------------------------------------

                    If you believe this is an error, please contact support or submit a new request with the correct details.

                    Regards,
                    Spazaafy Admin Team
                    """
                    
                    email = EmailMessage(
                        subject=subject,
                        body=body,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[req.user.email]
                    )
                    email.send()
                except Exception as e:
                    print(f"Failed to send cancellation email to {req.user.email}: {e}")

        return Response({"detail": f"Successfully updated {updated_count} requests."}, status=status.HTTP_200_OK)

    # ✅ Override PARTIAL_UPDATE (Single Item PATCH) for Cancellation
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get('status')
        cancellation_reason = request.data.get('cancellation_reason')

        # Run standard update first
        response = super().partial_update(request, *args, **kwargs)

        # If status changed to CANCELLED, send email
        if new_status == 'CANCELLED':
            try:
                subject = f"Update on Request {instance.reference_code}: Cancelled"
                body = f"""
                Dear {instance.user.first_name},

                Your request for assistance regarding "{instance.assistance_type}" (Ref: {instance.reference_code}) has been CANCELLED.

                Reason for cancellation:
                --------------------------------------------------
                {cancellation_reason or "No specific reason provided."}
                --------------------------------------------------

                Regards,
                Spazaafy Admin Team
                """
                email = EmailMessage(
                    subject=subject,
                    body=body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[instance.user.email]
                )
                email.send()
            except Exception as e:
                print(f"Error sending cancellation email: {e}")

        return response