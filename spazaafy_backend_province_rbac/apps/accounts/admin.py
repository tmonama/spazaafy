from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as Base
from .models import User

@admin.register(User)
class UserAdmin(Base):
    list_display=('username','email','role','province','is_staff','is_active')
    list_filter=('role','province','is_staff','is_superuser','is_active')
    fieldsets = Base.fieldsets + (('Role & Scope', {'fields':('role','phone','province')}), 
                                  ('Notifications', {'fields': ('expo_push_token',)}),)
