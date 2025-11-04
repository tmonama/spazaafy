from django.db import models
from django.conf import settings
from apps.shops.models import SpazaShop
from django.utils.translation import gettext_lazy as _

class SiteVisitStatus(models.TextChoices):
    PENDING = 'PENDING', _('Pending')
    SCHEDULED = 'SCHEDULED', _('Scheduled')
    IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
    COMPLETED = 'COMPLETED', _('Completed')
    CANCELLED = 'CANCELLED', _('Cancelled')
    EXPIRED = 'EXPIRED', _('Expired')

class SiteVisit(models.Model):
    shop = models.ForeignKey(SpazaShop, on_delete=models.CASCADE, related_name='site_visits')
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='requested_visits')
    inspector = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_visits')
    requested_datetime = models.DateTimeField()
    status = models.CharField(max_length=30, choices=SiteVisitStatus.choices, default=SiteVisitStatus.PENDING) 
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True); updated_at = models.DateTimeField(auto_now=True)
    share_code = models.CharField(max_length=10, null=True, blank=True, unique=True)
    share_code_expires_at = models.DateTimeField(null=True, blank=True)

class SiteVisitForm(models.Model):
    visit = models.OneToOneField(SiteVisit, on_delete=models.CASCADE, related_name='form')
    inspector_name = models.CharField(max_length=100, blank=True)
    inspector_surname = models.CharField(max_length=100, blank=True)
    contractor_company = models.CharField(max_length=200, blank=True)
    cleanliness = models.CharField(max_length=20, choices=[('Poor','Poor'),('Fair','Fair'),('Good','Good'),('Excellent','Excellent')])
    stock_rotation_observed = models.BooleanField(default=False)
    fire_extinguisher_valid = models.BooleanField(default=False)
    business_licence_displayed = models.BooleanField(default=False)
    health_certificate_displayed = models.BooleanField(default=False)
    
    # --- ADD THESE NEW FIELDS ---
    refund_policy_visible = models.BooleanField(default=False)
    sales_record_present = models.BooleanField(default=False)
    inventory_system_in_place = models.BooleanField(default=False)
    food_labels_and_expiry_present = models.BooleanField(default=False)
    prices_visible = models.BooleanField(default=False)
    notices_policies_displayed = models.BooleanField(default=False)
    supplier_list_present = models.BooleanField(default=False)
    building_plan_present = models.BooleanField(default=False)
    adequate_ventilation = models.BooleanField(default=False)
    healthy_storage_goods = models.BooleanField(default=False)
    # --- END OF NEW FIELDS ---
    
    inspector_notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)