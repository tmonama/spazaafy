from django.contrib import admin
from .models import SiteVisit, SiteVisitForm
@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    list_display=('id','shop','status','requested_by','inspector','requested_datetime','created_at')
    list_filter=('status',)
@admin.register(SiteVisitForm)
class SiteVisitFormAdmin(admin.ModelAdmin):
    list_display=('id','visit','cleanliness','submitted_at')
