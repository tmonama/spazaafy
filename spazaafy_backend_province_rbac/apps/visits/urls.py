from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteVisitViewSet, SiteVisitFormViewSet

router = DefaultRouter()

# ✅ THE FIX: Register the most specific route FIRST
router.register(r'forms', SiteVisitFormViewSet, basename='visit-forms')

# Register the general, "catch-all" route SECOND
router.register(r'', SiteVisitViewSet, basename='visit')

urlpatterns = [
    path('', include(router.urls)),
]