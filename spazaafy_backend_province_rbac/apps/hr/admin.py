from django.contrib import admin
from .models import (
    Employee, HiringRequest, JobApplication, 
    TrainingSession, TrainingSignup, HRComplaint, Announcement
)

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'email', 'department', 'role_title', 'status', 'user_account')
    list_filter = ('status', 'department')
    search_fields = ('first_name', 'last_name', 'email')
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

@admin.register(HiringRequest)
class HiringRequestAdmin(admin.ModelAdmin):
    list_display = ('role_title', 'department', 'status', 'created_at')
    list_filter = ('status', 'department')

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'hiring_request', 'status', 'submitted_at')
    list_filter = ('status',)

@admin.register(TrainingSession)
class TrainingSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'date_time', 'status', 'is_compulsory')
    list_filter = ('status', 'is_compulsory')

@admin.register(TrainingSignup)
class TrainingSignupAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'training', 'submitted_at')

@admin.register(HRComplaint)
class HRComplaintAdmin(admin.ModelAdmin):
    list_display = ('type', 'complainant', 'status', 'created_at')
    list_filter = ('status', 'type')

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'date_posted', 'author')