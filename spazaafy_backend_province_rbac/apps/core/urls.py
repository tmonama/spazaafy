from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProvinceViewSet, CRMViewSet

router = DefaultRouter()
router.register(r'provinces', ProvinceViewSet)
router.register(r'crm', CRMViewSet, basename='crm')

urlpatterns = [
    path('', include(router.urls)),
]