from rest_framework import viewsets, permissions
from .models import Province, Campaign, EmailTemplate, EmailLog
from .serializers import ProvinceSerializer, CampaignSerializer, EmailTemplateSerializer
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from rest_framework.response import Response
from django.conf import settings
from apps.accounts.models import User
from rest_framework.decorators import action
from django.db.models import Count 

class ProvinceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for viewing Provinces.
    """
    queryset = Province.objects.all().order_by('name')
    serializer_class = ProvinceSerializer
    permission_classes = [permissions.AllowAny]

class CRMViewSet(viewsets.ModelViewSet):
    """
    Unified ViewSet for CRM Actions (Campaigns & Templates)
    """
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['post'])
    def create_campaign(self, request):
        name = request.data.get('name')
        if not name: return Response({"detail": "Name required"}, status=400)
        
        camp = Campaign.objects.create(name=name, created_by=request.user)
        return Response(CampaignSerializer(camp).data)

    @action(detail=True, methods=['post'])
    def create_template(self, request, pk=None):
        campaign = self.get_object()
        data = request.data
        
        tpl = EmailTemplate.objects.create(
            campaign=campaign,
            name=data['name'],
            subject=data['subject'],
            purpose=data['purpose'],
            content=data['content'],
            links=data.get('links', [])
        )
        return Response(EmailTemplateSerializer(tpl).data)

    @action(detail=True, methods=['get'])
    def templates(self, request, pk=None):
        campaign = self.get_object()
        return Response(EmailTemplateSerializer(campaign.templates.all(), many=True).data)

    # ==========================================================================
    # ACTION: SEND EMAIL
    # ==========================================================================
    @action(detail=False, methods=['post'])
    def send_email(self, request):
        template_id = request.data.get('template_id')
        recipients_groups = request.data.get('recipients', []) # e.g. ['consumers', 'tech']
        
        try:
            template = EmailTemplate.objects.get(id=template_id)
        except EmailTemplate.DoesNotExist:
            return Response({"detail": "Template not found"}, status=404)

        # 1. Select Target Users based on roles
        # Use a dictionary to avoid sending duplicate emails if a user has multiple roles (rare but possible)
        # Key: UserID, Value: (UserObject, GroupLabel)
        targets_map = {}

        if 'consumers' in recipients_groups:
            users = User.objects.filter(role='CONSUMER', is_active=True)
            for u in users: targets_map[u.id] = (u, 'Consumer')
            
        if 'owners' in recipients_groups:
            users = User.objects.filter(role='OWNER', is_active=True)
            for u in users: targets_map[u.id] = (u, 'Spaza Shop')
            
        if 'employees' in recipients_groups:
            users = User.objects.filter(role='EMPLOYEE', is_active=True)
            for u in users: targets_map[u.id] = (u, 'Employee')
            
        if 'admin' in recipients_groups:
            # Targets HR, Legal, and Global Admins
            users = User.objects.filter(role='ADMIN', is_active=True)
            for u in users: targets_map[u.id] = (u, 'Admin/Internal')

        if not targets_map:
            return Response({"detail": "No recipients found for selected groups."}, status=400)

        # 2. Determine Design Theme based on Purpose
        # #1e1e1e (Dark), #22c55e (Green), #ef4444 (Red)
        theme_color = "#1e1e1e" # Default / General / New Feature
        header_bg = "#1e1e1e"
        text_color = "#333333"
        
        if template.purpose == 'NEW_FEATURE':
            theme_color = "#1e1e1e" # Apple-style Dark
            header_bg = "linear-gradient(135deg, #1e1e1e 0%, #434343 100%)"
        elif template.purpose == 'EVENT':
            theme_color = "#ef4444" # Vibrant Red
            header_bg = "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
        elif template.purpose == 'UPDATE':
            theme_color = "#22c55e" # Green
            header_bg = "#22c55e"

        # 3. Construct Links HTML
        links_html = ""
        if template.links:
            for link in template.links:
                url = link.get('url', '#')
                label = link.get('label', 'View')
                l_type = link.get('type', 'button')

                if l_type == 'button':
                    links_html += f'''
                        <a href="{url}" style="background-color:{theme_color}; color:#ffffff; padding:12px 24px; 
                           text-decoration:none; border-radius:6px; font-weight:bold; margin:5px; display:inline-block;">
                           {label}
                        </a>
                    '''
                else:
                    links_html += f'''
                        <p style="margin-top:10px;">
                            <a href="{url}" style="color:{theme_color}; text-decoration:underline;">{label}</a>
                        </p>
                    '''

        # 4. Construct Full HTML Email
        # Note: In production, put this in a dedicated template file (e.g., templates/emails/crm_base.html)
        logo_url = "https://spazaafy-frontend-wired.onrender.com/media/spazaafy-logo.png" # Replace with your actual hosted logo URL
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                
                <!-- Header -->
                <div style="background: {header_bg}; padding: 30px 20px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">
                        Spazaafy
                    </h2>
                </div>

                <!-- Body -->
                <div style="padding: 40px 30px; color: {text_color};">
                    <h3 style="color: {theme_color}; margin-top: 0; font-size: 20px;">{template.subject}</h3>
                    
                    <div style="line-height: 1.6; font-size: 16px; margin-bottom: 30px; white-space: pre-wrap;">
                        {template.content}
                    </div>

                    <!-- Links/Buttons -->
                    <div style="text-align: center; margin-top: 35px; border-top: 1px solid #eeeeee; padding-top: 25px;">
                        {links_html}
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0;">&copy; {timezone.now().year} Spazaafy Platform. All rights reserved.</p>
                    <p style="margin: 5px 0 0;">This is an automated message. Please do not reply directly.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = strip_tags(html_content)
        sent_count = 0
        
        # 5. Send Loop (Synchronous)
        # Ideally, offload this to Celery for large lists.
        for user, group_name in targets_map.values():
            if not user.email: 
                continue
            
            status_code = 'SENT'
            error_message = None
            
            try:
                msg = EmailMultiAlternatives(
                    subject=template.subject,
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email]
                )
                msg.attach_alternative(html_content, "text/html")
                msg.send()
                sent_count += 1
            except Exception as e:
                status_code = 'FAILED'
                error_message = str(e)
                print(f"Error sending email to {user.email}: {e}")

            # 6. Create Log Entry
            EmailLog.objects.create(
                template=template,
                recipient=user,
                recipient_email=user.email,
                target_group=group_name,
                status=status_code,
                error_message=error_message
            )

        return Response({
            "detail": f"Campaign execution complete. Sent to {sent_count} of {len(targets_map)} targets."
        })

    # ==========================================================================
    # ACTION: GET TEMPLATE ANALYTICS
    # ==========================================================================
    @action(detail=False, methods=['get'])
    def template_analytics(self, request):
        """
        Endpoint: /api/core/crm/template_analytics/?template_id=UUID
        Returns aggregated stats and recent logs for a specific template.
        """
        template_id = request.query_params.get('template_id')
        if not template_id:
             return Response({"detail": "Template ID required"}, status=400)
             
        # Filter logs for this template
        logs = EmailLog.objects.filter(template_id=template_id)
        
        # 1. Summary Stats
        total_targeted = logs.count()
        success = logs.filter(status='SENT').count()
        failed = logs.filter(status='FAILED').count()
        
        # 2. Breakdown by Target Group (for Bar/Pie Chart)
        # Returns: [{'target_group': 'Consumer', 'count': 50}, {'target_group': 'Tech', 'count': 10}]
        by_group = list(logs.values('target_group').annotate(count=Count('id')).order_by('-count'))
        
        # 3. Recent Logs (for the table)
        # Limit to last 100 to prevent payload bloat
        recent_logs = logs.order_by('-sent_at')[:100].values(
            'recipient_email', 
            'target_group', 
            'status', 
            'error_message', 
            'sent_at'
        )

        return Response({
            "summary": {
                "total": total_targeted,
                "success": success,
                "failed": failed,
                # Avoid division by zero
                "success_rate": round((success / total_targeted * 100), 1) if total_targeted > 0 else 0
            },
            "breakdown": by_group,
            "logs": recent_logs
        })