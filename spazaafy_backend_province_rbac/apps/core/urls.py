from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProvinceViewSet

router = DefaultRouter()
router.register(r'provinces', ProvinceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]