from rest_framework.routers import DefaultRouter
from .views import SpazaShopViewSet
router = DefaultRouter()
router.register(r'', SpazaShopViewSet, basename='shops')
urlpatterns = router.urls
