from django.shortcuts import render

from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LegalRequest
from .serializers import LegalRequestPublicSerializer, LegalRequestAdminSerializer
from django.core.mail import send_mail
from django.conf import settings

# 5.2 Public Intake Form Endpoint
class PublicLegalSubmissionView(generics.CreateAPIView):
    queryset = LegalRequest.objects.all()
    serializer_class = LegalRequestPublicSerializer
    permission_classes = [permissions.AllowAny] # ✅ Publicly Accessible

    def perform_create(self, serializer):
        instance = serializer.save()
        
        # Notify Legal Team
        send_mail(
            subject=f"⚖️ New Legal Request: {instance.title}",
            message=f"Urgency: {instance.get_urgency_display()}\nFrom: {instance.submitter_name} ({instance.department})\n\nAccess via Legal Admin Portal.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['legal@spazaafy.co.za'], # Configure this email
            fail_silently=True
        )

# 5.3 & 5.4 Legal Admin Portal Endpoints
class LegalAdminViewSet(viewsets.ModelViewSet):
    queryset = LegalRequest.objects.all().order_by('-created_at')
    serializer_class = LegalRequestAdminSerializer
    # Only Admins (Staff) can access this
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        instance = self.get_object()
        new_status = request.data.get('status')
        note = request.data.get('note', '')

        if new_status:
            instance.status = new_status
            if note:
                instance.internal_notes += f"\n[{new_status}]: {note}"
            instance.save()
            
            # Notify Submitter of decision
            send_mail(
                subject=f"Legal Review Update: {instance.title}",
                message=f"Status changed to: {instance.get_status_display()}.\n\nNote: {note}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.submitter_email],
                fail_silently=True
            )
            
            return Response(LegalRequestAdminSerializer(instance).data)
        return Response({"detail": "Status required"}, status=400)