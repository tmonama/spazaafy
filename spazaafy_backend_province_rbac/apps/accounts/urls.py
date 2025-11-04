# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, MeView, UserViewSet

# 1. Create a router
router = DefaultRouter()

# 2. Register your UserViewSet with the router
# This automatically creates the '/users/' and '/users/{id}/' endpoints
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login',    LoginView.as_view(),    name='login'),
    path('me',       MeView.as_view(),       name='me'),
    # SimpleJWT refresh endpoint (frontend uses this when access token expires)
    path('jwt/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)) # Include the new user routes

]
