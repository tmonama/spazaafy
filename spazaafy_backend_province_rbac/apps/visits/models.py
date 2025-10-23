from django.db import models
from django.conf import settings
from apps.shops.models import SpazaShop

class SiteVisitStatus(models.TextChoices):
    PENDING="PENDING","Pending"; SCHEDULED="SCHEDULED","Scheduled"; IN_PROGRESS="IN_PROGRESS","In Progress"; COMPLETED="COMPLETED","Completed"; CANCELLED="CANCELLED","Cancelled"

class SiteVisit(models.Model):
    shop = models.ForeignKey(SpazaShop, on_delete=models.CASCADE, related_name='site_visits')
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='requested_visits')
    inspector = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_visits')
    requested_datetime = models.DateTimeField()
    status = models.CharField(max_length=20, choices=SiteVisitStatus.choices, default=SiteVisitStatus.PENDING)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True); updated_at = models.DateTimeField(auto_now=True)

class SiteVisitForm(models.Model):
    visit = models.OneToOneField(SiteVisit, on_delete=models.CASCADE, related_name='form')
    cleanliness = models.CharField(max_length=20, choices=[('Poor','Poor'),('Fair','Fair'),('Good','Good'),('Excellent','Excellent')])
    stock_rotation_observed = models.BooleanField(default=False)
    fire_extinguisher_valid = models.BooleanField(default=False)
    business_licence_displayed = models.BooleanField(default=False)
    health_certificate_displayed = models.BooleanField(default=False)
    inspector_notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
