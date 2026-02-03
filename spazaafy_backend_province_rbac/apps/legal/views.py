# apps/legal/views.py

from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LegalRequest, LegalStatus, LegalAttachment
from .serializers import LegalRequestPublicSerializer, LegalRequestAdminSerializer, AmendmentUploadSerializer
from django.conf import settings 
from django.shortcuts import get_object_or_404
import uuid
from django.utils import timezone
from datetime import timedelta
from apps.core.utils import send_email_with_fallback

class PublicLegalSubmissionView(generics.CreateAPIView):
    queryset = LegalRequest.objects.all()
    serializer_class = LegalRequestPublicSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        instance = serializer.save()
        
        # ✅ Handle Multiple Files
        files = self.request.FILES.getlist('documents') # Frontend must send 'documents' key
        
        for f in files:
            LegalAttachment.objects.create(legal_request=instance, file=f)
        
        # Determine count for email text
        file_count = len(files)
        
        body = f"Urgency: {instance.get_urgency_display()}\nFrom: {instance.submitter_name} ({instance.department})\nFiles Attached: {file_count}\n\nAccess via Legal Admin Portal."
        
        send_email_with_fallback(
            subject=f"⚖️ New Legal Request: {instance.title}",
            recipient_list=['legal@spazaafy.co.za'],
            backup_body=body
        )

class SubmitAmendmentView(generics.UpdateAPIView):
    queryset = LegalRequest.objects.all()
    serializer_class = AmendmentUploadSerializer
    permission_classes = [permissions.AllowAny] 
    lookup_field = 'amendment_token' 

    def update(self, request, *args, **kwargs):
        token = self.kwargs.get('amendment_token')
        instance = get_object_or_404(LegalRequest, amendment_token=token)
        
        file_obj = request.FILES.get('revision_file')
        if not file_obj:
            return Response({"detail": "File is required"}, status=400)

        instance.revision_file = file_obj
        instance.status = LegalStatus.AMENDMENT_SUBMITTED
        instance.internal_notes += f"\n[SYSTEM]: Amendment uploaded by user on {timezone.now()}"
        instance.amendment_token = None 
        
        if instance.paused_at:
            pause_duration = timezone.now() - instance.paused_at
            instance.total_paused_duration += pause_duration
            instance.paused_at = None
            instance.amendment_deadline = None

        instance.save()

        body = f"A revised document has been uploaded for case #{str(instance.id)[:8]}.\nStatus has been reset to Under Review."
        
        send_email_with_fallback(
            subject=f"🔄 Amendment Received: {instance.title}",
            recipient_list=['legal@spazaafy.co.za'],
            backup_body=body
        )

        return Response({"detail": "Amendment uploaded successfully."})

class LegalAdminViewSet(viewsets.ModelViewSet):
    queryset = LegalRequest.objects.all().order_by('-created_at')
    serializer_class = LegalRequestAdminSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        instance = self.get_object()
        new_status = request.data.get('status')
        note = request.data.get('note', '')
        amendment_days = int(request.data.get('amendment_days', 7))

        if new_status:
            instance.status = new_status
            if note:
                instance.internal_notes += f"\n[{new_status}]: {note}"
            
            upload_link = ""
            if new_status == 'AMENDMENT_REQ':
                token = uuid.uuid4()
                instance.amendment_token = token
                frontend_url = settings.FRONTEND_URL.rstrip('/')
                upload_link = f"{frontend_url}/legal/amend/{token}"
                
                instance.paused_at = timezone.now()
                instance.amendment_deadline = timezone.now() + timedelta(days=amendment_days)

            instance.save()
            
            # HR TERMINATION WORKFLOW INTEGRATION
            if instance.category == 'TERMINATION' and instance.related_employee_id:
                from apps.hr.models import Employee 
                try:
                    emp = Employee.objects.get(id=instance.related_employee_id)
                    
                    if new_status == 'APPROVED':
                        emp.status = 'NOTICE_GIVEN'
                        emp.save()
                    
                    elif new_status == 'REJECTED':
                        emp.status = 'EMPLOYED'
                        emp.save()
                        
                except Employee.DoesNotExist:
                    print(f"Warning: Linked Employee {instance.related_employee_id} not found.")

            if instance.submitter_email:
                email_body = f"The status of your legal request has changed.\n\nNew Status: {instance.get_status_display()}\n\nLegal Note/Instruction:\n{note}"

                if upload_link:
                    deadline_str = instance.amendment_deadline.strftime('%d %B %Y')
                    email_body += f"\n\n--------------------------------------------------\nACTION REQUIRED:\nPlease upload the amended document using the link below.\nDEADLINE: {deadline_str} ({amendment_days} Days)\nLink: {upload_link}\n--------------------------------------------------"

                send_email_with_fallback(
                    subject=f"Legal Review Update: {instance.title}",
                    recipient_list=[instance.submitter_email],
                    backup_body=email_body
                )
            
            return Response(LegalRequestAdminSerializer(instance).data)
            
        return Response({"detail": "Status required"}, status=400)