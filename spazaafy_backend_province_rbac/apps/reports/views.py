from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count
from apps.core.models import Province
from apps.shops.models import SpazaShop
from apps.compliance.models import Document
from apps.support.models import Ticket
from apps.visits.models import SiteVisit

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
