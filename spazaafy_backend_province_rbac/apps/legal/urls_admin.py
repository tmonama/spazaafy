from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LegalAdminViewSet

router = DefaultRouter()
# Registers endpoints:
# GET  /api/legal/admin/requests/ (List all)
# GET  /api/legal/admin/requests/{id}/ (View specific)
# POST /api/legal/admin/requests/{id}/update_status/ (Approve/Reject)
router.register(r'requests', LegalAdminViewSet, basename='legal-admin')

urlpatterns = [
    path('', include(router.urls)),
]