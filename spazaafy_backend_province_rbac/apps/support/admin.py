from django.contrib import admin
from .models import Ticket
@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display=('id','title','status','user','created_at')
    list_filter=('status',)
