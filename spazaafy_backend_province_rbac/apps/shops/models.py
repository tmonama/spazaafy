
from django.db import models
from django.conf import settings
from apps.core.models import Province
import math

USE_GIS=False
try:
    from django.contrib.gis.db import models as gismodels
    USE_GIS=True
except Exception:
    pass

class SpazaShop(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shops')
    province = models.ForeignKey(Province, on_delete=models.PROTECT, related_name='shops')
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=500, blank=True)
    if USE_GIS:
        location = gismodels.PointField(null=True, blank=True, srid=4326)
    else:
        latitude = models.FloatField(null=True, blank=True)
        longitude = models.FloatField(null=True, blank=True)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self): return self.name

    def distance_km_from(self, lat, lng):
        if USE_GIS: return None
        if self.latitude is None or self.longitude is None: return None
        R=6371.0
        dlat=math.radians(lat - self.latitude); dlng=math.radians(lng - self.longitude)
        a=(math.sin(dlat/2)**2 + math.cos(math.radians(self.latitude))*math.cos(math.radians(lat))*math.sin(dlng/2)**2)
        return 2*math.atan2(math.sqrt(a), math.sqrt(1-a))*R

    # --- ADD THIS NEW METHOD ---
    def check_and_update_verification(self):
        """
        Checks if all required documents are verified and updates the shop's
        verification status accordingly.
        """
        # These are the document TYPE codes required for verification
        REQUIRED_DOC_TYPES = {"COR_REG", "TAX", "COA"}
        
        verified_docs = self.documents.filter(status='VERIFIED')
        verified_doc_types = set(verified_docs.values_list('type', flat=True))
        
        if REQUIRED_DOC_TYPES.issubset(verified_doc_types):
            self.verified = True
        else:
            self.verified = False
        self.save()