from rest_framework.routers import DefaultRouter
from .views import SiteVisitViewSet, SiteVisitFormViewSet

router = DefaultRouter()
# Root route for all site visits → /api/visits/
router.register(r'', SiteVisitViewSet, basename='visits')
# Optional form route → /api/visits/forms/
router.register(r'forms', SiteVisitFormViewSet, basename='visit-forms')

urlpatterns = router.urls
