from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, AdminVerificationCode, EmailVerificationToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ('email',)
    list_display = (
        'email',
        'first_name',
        'last_name',
        'role',
        'department',
        'province',
        'is_staff',
        'is_active',
        'date_joined',
    )
    list_filter = (
        'role',
        'department',
        'province',
        'is_staff',
        'is_superuser',
        'is_active',
    )
    search_fields = ('email', 'first_name', 'last_name')

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            'Role & Access',
            {
                'fields': (
                    'role',
                    'department',
                    'province',
                    'phone',
                )
            },
        ),
        (
            'Notifications',
            {
                'fields': ('expo_push_token',),
            },
        ),
    )

    readonly_fields = ('date_joined', 'last_login')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('province')


@admin.register(AdminVerificationCode)
class AdminVerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'created_at')
    search_fields = ('email',)
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'created_at', 'is_expired')
    search_fields = ('user__email',)
    readonly_fields = ('token', 'created_at')

    def is_expired(self, obj):
        return obj.is_expired()

    is_expired.boolean = True
    is_expired.short_description = "Expired?"
