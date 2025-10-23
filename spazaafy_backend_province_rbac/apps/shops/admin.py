from django.contrib import admin
from .models import SpazaShop
@admin.register(SpazaShop)
class SpazaShopAdmin(admin.ModelAdmin):
    list_display=('name','owner','province','verified','created_at')
    list_filter=('province','verified')
    search_fields=('name','owner__email')
