# accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, MeView

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login',    LoginView.as_view(),    name='login'),
    path('me',       MeView.as_view(),       name='me'),
    # SimpleJWT refresh endpoint (frontend uses this when access token expires)
    path('jwt/refresh/', TokenRefreshView.as_view(), name='token_refresh')
]
