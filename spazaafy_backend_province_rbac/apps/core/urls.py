from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProvinceViewSet, CRMViewSet, StatusPageViewSet, StatusAdminViewSet

router = DefaultRouter()
router.register(r'provinces', ProvinceViewSet)
router.register(r'crm', CRMViewSet, basename='crm')
router.register(r'status-admin', StatusAdminViewSet, basename='status-admin')

urlpatterns = [
    path('status/public/', StatusPageViewSet.as_view({'get': 'summary'}), name='status-public'),
    path('', include(router.urls)),
]