from django.contrib import admin
from .models import Document
@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display=('id','shop','type','status','expiry_date','uploaded_at','verified_by')
    list_filter=('type','status')
