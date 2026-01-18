from django.contrib import admin
from .models import LegalRequest

@admin.register(LegalRequest)
class LegalRequestAdmin(admin.ModelAdmin):
    list_display = ('title', 'submitter_name', 'category', 'urgency', 'status', 'created_at')
    list_filter = ('status', 'category', 'urgency', 'department')
    search_fields = ('title', 'submitter_name', 'reference_code')