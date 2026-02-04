from rest_framework import viewsets, permissions
from .models import Province, Campaign, EmailTemplate, EmailLog, SystemComponent, SystemIncident
from .serializers import ProvinceSerializer, CampaignSerializer, EmailTemplateSerializer, SystemComponentSerializer, SystemIncidentSerializer
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags, linebreaks
from django.utils import timezone
from rest_framework.response import Response
from django.conf import settings
from apps.accounts.models import User
from rest_framework.decorators import action
from django.db.models import Count 
from django.shortcuts import get_object_or_404

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
    # ACTION: SEND EMAIL (Watermelon Theme + No Background Logo)
    # ==========================================================================
    @action(detail=False, methods=['post'])
    def send_email(self, request):
        template_id = request.data.get('template_id')
        recipients_groups = request.data.get('recipients', []) 
        
        try:
            template = EmailTemplate.objects.get(id=template_id)
        except EmailTemplate.DoesNotExist:
            return Response({"detail": "Template not found"}, status=404)

        # 1. Select Targets
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
            users = User.objects.filter(role='ADMIN', is_active=True)
            for u in users: targets_map[u.id] = (u, 'Admin/Internal')

        if not targets_map:
            return Response({"detail": "No recipients found."}, status=400)

        # 2. THEME CONFIGURATION
        gradient_style = "background: linear-gradient(90deg, #ff3131 0%, #4ac351 100%);"
        button_style = f"background: linear-gradient(90deg, #ff3131 0%, #4ac351 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 49, 49, 0.2);"
        link_color = "#ff3131"

        # 3. Build Image HTML
        image_html = ""
        if template.hero_image:
            img_url = template.hero_image.url
            if not img_url.startswith('http'):
                img_url = request.build_absolute_uri(img_url)
            
            image_html = f"""
            <div style="margin: 20px 0 30px 0; text-align: center;">
                <img src="{img_url}" alt="Update" 
                     style="width: 100%; max-width: 100%; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); display: block;" />
            </div>
            """

        # 4. Build Buttons
        buttons_html = ""
        if template.links:
            for link in template.links:
                url = link.get('url', '#')
                label = link.get('label', 'View')
                l_type = link.get('type', 'button')

                if l_type == 'button':
                    buttons_html += f'<div style="margin-top: 30px;"><a href="{url}" style="{button_style}">{label}</a></div>'
                else:
                    buttons_html += f'<p style="margin-top:20px;"><a href="{url}" style="color:{link_color}; text-decoration:underline; font-weight:500;">{label} &rarr;</a></p>'

        # 5. Format Content
        formatted_content = linebreaks(template.content)

        # 6. Full HTML Template
        # ✅ UPDATED LOGO URL
        logo_url = "https://spazaafy-frontend-wired.onrender.com/media/spazaafy-logo-no-background.png"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{template.subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 0; color: #111827;">
            
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                
                <!-- Top Gradient Bar -->
                <div style="height: 8px; width: 100%; {gradient_style}"></div>

                <!-- Main Content Area -->
                <div style="padding: 40px;">
                    
                    <!-- Logo -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <img src="{logo_url}" alt="Spazaafy" width="140" style="display: inline-block;" />
                    </div>

                    <!-- Personalized Greeting Placeholder -->
                    <p style="text-align: center; font-size: 18px; font-weight: 600; margin: 0 0 10px 0; color: #4b5563;">
                        __GREETING__
                    </p>

                    <!-- Headline -->
                    <h1 style="font-size: 24px; font-weight: 800; text-align: center; margin: 0 0 10px 0; color: #111827;">
                        {template.subject}
                    </h1>

                    <!-- Image -->
                    {image_html}

                    <!-- Body Text -->
                    <div style="font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
                        {formatted_content}
                    </div>

                    <!-- Call to Action -->
                    <div style="text-align: center;">
                        {buttons_html}
                    </div>

                    <!-- Fallback Link Block -->
                    {f'''
                    <div style="margin-top: 40px; padding: 20px; background-color: #f3f4f6; border-radius: 8px; text-align: center; font-size: 12px; color: #6b7280;">
                        <p style="margin-bottom: 5px;">If the button doesn't work, copy and paste this link:</p>
                        <a href="{template.links[0]['url']}" style="color: #ff3131; text-decoration: underline; word-break: break-all;">{template.links[0]['url']}</a>
                    </div>
                    ''' if template.links and template.links[0]['type'] == 'button' else ''}

                </div>

                <!-- Footer -->
                <div style="padding: 30px; text-align: center; background-color: #ffffff; border-top: 1px solid #f3f4f6;">
                    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                        You received this email because you are a registered user of Spazaafy.
                    </p>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
                        &copy; {timezone.now().year} Spazaafy Platform. All rights reserved.
                    </p>
                </div>
            </div>

        </body>
        </html>
        """

        text_content = strip_tags(html_content)
        sent_count = 0
        
        for user, group_name in targets_map.values():
            if not user.email: continue
            
            # Personalize Greeting
            user_name = user.first_name.strip() if user.first_name else "there"
            greeting = f"Hi {user_name},"
            
            # Replace placeholder
            personal_html = html_content.replace("__GREETING__", greeting)

            status_code = 'SENT'
            error_message = None
            try:
                msg = EmailMultiAlternatives(
                    subject=template.subject, body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL, to=[user.email]
                )
                msg.attach_alternative(personal_html, "text/html")
                msg.send()
                sent_count += 1
            except Exception as e:
                status_code = 'FAILED'
                error_message = str(e)
            
            EmailLog.objects.create(
                template=template, recipient=user, recipient_email=user.email,
                target_group=group_name, status=status_code, error_message=error_message
            )

        return Response({"detail": f"Processed {len(targets_map)} emails. {sent_count} sent successfully."})

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
    
    @action(detail=False, methods=['patch'])
    def update_template(self, request):
        """
        Endpoint: /api/core/crm/update_template/
        Body: { id: "uuid", name: "...", ... }
        """
        template_id = request.data.get('id')
        if not template_id:
            return Response({"detail": "Template ID required"}, status=400)
            
        template = get_object_or_404(EmailTemplate, id=template_id)
        
        # Pass partial=True so we don't have to send every single field if we don't want to
        serializer = EmailTemplateSerializer(template, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    

class StatusPageViewSet(viewsets.ViewSet):
    """
    Public API for the Status Page
    """
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        components = SystemComponent.objects.all()
        # Get incidents from the last 7 days or active ones
        incidents = SystemIncident.objects.all().order_by('-created_at')[:5]
        
        return Response({
            "components": SystemComponentSerializer(components, many=True).data,
            "incidents": SystemIncidentSerializer(incidents, many=True).data
        })

class StatusAdminViewSet(viewsets.ModelViewSet):
    """
    Tech Admin API to manage components and incidents
    """
    permission_classes = [permissions.IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.query_params.get('type') == 'incident':
            return SystemIncidentSerializer
        return SystemComponentSerializer

    def get_queryset(self):
        if self.request.query_params.get('type') == 'incident':
            return SystemIncident.objects.all()
        return SystemComponent.objects.all()

    @action(detail=False, methods=['post'])
    def update_component(self, request):
        c_id = request.data.get('id')
        status = request.data.get('status')
        try:
            comp = SystemComponent.objects.get(id=c_id)
            comp.status = status
            comp.save()
            return Response(SystemComponentSerializer(comp).data)
        except SystemComponent.DoesNotExist:
            return Response({"detail": "Not found"}, 404)