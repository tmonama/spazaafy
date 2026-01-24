from django.shortcuts import render

from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LegalRequest, LegalStatus
from .serializers import LegalRequestPublicSerializer, LegalRequestAdminSerializer, AmendmentUploadSerializer
from django.core.mail import send_mail
from django.conf import settings 
from django.shortcuts import get_object_or_404
import uuid

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

# ✅ NEW: Public Endpoint to Upload Amendment
class SubmitAmendmentView(generics.UpdateAPIView):
    queryset = LegalRequest.objects.all()
    serializer_class = AmendmentUploadSerializer
    permission_classes = [permissions.AllowAny] # Public, secured by Token
    lookup_field = 'amendment_token' # Find object by token, not ID

    def update(self, request, *args, **kwargs):
        token = self.kwargs.get('amendment_token')
        instance = get_object_or_404(LegalRequest, amendment_token=token)
        
        # Upload the file
        file_obj = request.FILES.get('revision_file')
        if not file_obj:
            return Response({"detail": "File is required"}, status=400)

        instance.revision_file = file_obj
        # Reset status so Legal knows it's back for review
        instance.status = LegalStatus.AMENDMENT_SUBMITTED
        instance.internal_notes += f"\n[SYSTEM]: Amendment uploaded by user on {instance.updated_at}"
        # Clear token to prevent reuse (One-time link)
        instance.amendment_token = None 
        instance.save()

        # Notify Legal Team
        send_mail(
            subject=f"🔄 Amendment Received: {instance.title}",
            message=f"A revised document has been uploaded for case #{str(instance.id)[:8]}.\nStatus has been reset to Under Review.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['legal@spazaafy.co.za'],
            fail_silently=True
        )

        return Response({"detail": "Amendment uploaded successfully."})

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
            # 1. Update the Legal Request itself
            instance.status = new_status
            if note:
                # Append note to history rather than overwriting
                instance.internal_notes += f"\n[{new_status}]: {note}"

                # ✅ AMENDMENT LOGIC
                upload_link = ""
                if new_status == 'AMENDMENT_REQ':
                    # 1. Generate Token
                    token = uuid.uuid4()
                    instance.amendment_token = token
                    
                    # 2. Generate Link (Frontend URL)
                    frontend_url = settings.FRONTEND_URL.rstrip('/')
                    upload_link = f"{frontend_url}/legal/amend/{token}"

            instance.save()
            
            # 2. HR TERMINATION WORKFLOW INTEGRATION
            # If this is a Termination request, automatically update the Employee status in HR
            if instance.category == 'TERMINATION' and instance.related_employee_id:
                # Lazy import to avoid circular dependencies between apps
                from apps.hr.models import Employee 
                
                try:
                    emp = Employee.objects.get(id=instance.related_employee_id)
                    
                    if new_status == 'APPROVED':
                        # Legal Approved -> Move to Notice Period (Step 2 of Termination)
                        emp.status = 'NOTICE_GIVEN'
                        emp.save()
                    
                    elif new_status == 'REJECTED':
                        # Legal Rejected -> Revert to Normal Employment
                        emp.status = 'EMPLOYED'
                        emp.save()
                        
                except Employee.DoesNotExist:
                    print(f"Warning: Linked Employee {instance.related_employee_id} not found.")

            # 3. Notify Submitter (HR or Partner) via Email
            # ✅ UPDATED EMAIL LOGIC
            if instance.submitter_email:
                email_body = f"""
                The status of your legal request has changed.
                
                New Status: {instance.get_status_display()}
                
                Legal Note/Instruction:
                {note}
                """

                if upload_link:
                    email_body += f"""
                    
                    --------------------------------------------------
                    ACTION REQUIRED:
                    Please upload the amended document using the link below:
                    {upload_link}
                    --------------------------------------------------
                    """

                send_mail(
                    subject=f"Legal Review Update: {instance.title}",
                    message=email_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.submitter_email],
                    fail_silently=True
                )
            
            return Response(LegalRequestAdminSerializer(instance).data)
            
        return Response({"detail": "Status required"}, status=400)