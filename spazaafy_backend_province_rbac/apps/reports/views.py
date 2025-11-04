import csv
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count
from apps.core.models import Province
from apps.shops.models import SpazaShop
from apps.compliance.models import Document, DocumentStatus
from apps.support.models import Ticket
from apps.visits.models import SiteVisit
from apps.accounts.models import User

class ProvinceReportView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def get(self, request):
        u = request.user
        province_id = request.query_params.get('province_id')
        if getattr(u,'role',None)=='ADMIN' and getattr(u,'province_id',None):
            province_id = u.province_id
        shops = SpazaShop.objects.all()
        if province_id: shops = shops.filter(province_id=province_id)
        data = {
            "province": Province.objects.filter(id=province_id).values_list('name', flat=True).first() if province_id else "ALL",
            "shops": {"total": shops.count(), "verified": shops.filter(verified=True).count(), "unverified": shops.filter(verified=False).count()},
            "documents": dict(Document.objects.filter(shop__in=shops).values_list('status').annotate(c=Count('id'))),
            "tickets": dict(Ticket.objects.filter(user__shops__in=shops).distinct().values_list('status').annotate(c=Count('id'))),
            "site_visits": dict(SiteVisit.objects.filter(shop__in=shops).values_list('status').annotate(c=Count('id'))),
        }
        return Response(data)
    


# --- ADD THIS NEW VIEW CLASS ---
class DashboardCSVExportView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="dashboard_summary.csv"'
        writer = csv.writer(response)
        
        # Header Row
        writer.writerow(['Metric', 'Value'])

        # Main Stats
        total_shops = SpazaShop.objects.count()
        pending_docs = Document.objects.filter(status=DocumentStatus.PENDING).count()
        total_consumers = User.objects.filter(role='CONSUMER').count() # Make sure to import User from apps.accounts.models
        
        writer.writerow(['Total Spaza Shops', total_shops])
        writer.writerow(['Pending Documents', pending_docs])
        writer.writerow(['Total Consumers', total_consumers])
        writer.writerow([]) # Add a blank row for spacing
        writer.writerow(['Shops per Province'])

        # Province Stats
        province_counts = SpazaShop.objects.values('province__name').annotate(count=Count('id')).order_by('province__name')
        for item in province_counts:
            writer.writerow([item['province__name'], item['count']])
            
        return response
