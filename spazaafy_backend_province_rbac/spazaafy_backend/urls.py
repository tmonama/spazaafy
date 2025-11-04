from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
# ✅ 1. Import necessary modules
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/',   SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),

    path('api/auth/',     include('apps.accounts.urls')),
    path('api/shops/',    include('apps.shops.urls')),
    path('api/compliance/', include('apps.compliance.urls')),
    path('api/support/',  include('apps.support.urls')),
    path('api/visits/',   include('apps.visits.urls')),   # <-- fixed mount path
    path('api/auth/password-reset/', include('apps.password_reset.urls')),
    path('api/reports/',  include('apps.reports.urls')),
    path('api/core/',  include('apps.core.urls')),
]

# ✅ 2. Add this block at the end of the file
# This tells Django to serve files from MEDIA_ROOT when in DEBUG mode.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)