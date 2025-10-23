from django.db import models
from django.conf import settings
from apps.shops.models import SpazaShop
from django.utils import timezone

class DocumentType(models.TextChoices):
    COR_REG = "COR_REG", "Business Reg"
    TAX = "TAX", "Tax Compliance"
    COA = "COA", "Health/COA"
    BUSINESS_LICENCE = "BUSINESS_LICENCE", "Business Licence / Trading Permit"
    FIRE_SAFETY = "FIRE_SAFETY", "Fire Safety Certificate"
    OTHER = "OTHER", "Other Supporting Documents"

class DocumentStatus(models.TextChoices):
    PENDING="PENDING","Pending"
    VERIFIED="VERIFIED","Verified"
    REJECTED="REJECTED","Rejected"

def upload_to(instance, filename):
    return f"docs/shop_{instance.shop_id}/{filename}"

class Document(models.Model):
    shop = models.ForeignKey(SpazaShop, on_delete=models.CASCADE, related_name='documents')
    type = models.CharField(max_length=20, choices=DocumentType.choices)
    file = models.FileField(upload_to=upload_to)
    status = models.CharField(max_length=20, choices=DocumentStatus.choices, default=DocumentStatus.PENDING)
    notes = models.TextField(blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='verified_documents')

    class Meta: ordering=['-uploaded_at']

    def mark_verified(self, user):
        self.status = DocumentStatus.VERIFIED; self.verified_at = timezone.now(); self.verified_by = user; self.save()
        required = {"COR_REG","TAX","COA"}
        types = set(self.shop.documents.filter(status=DocumentStatus.VERIFIED).values_list('type', flat=True))
        if required.issubset(types):
            self.shop.verified = True; self.shop.save()
