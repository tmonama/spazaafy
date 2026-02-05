# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (RegisterView, LoginView, MeView, UserViewSet, RequestAdminVerificationCodeView, 
    AdminVerifiedRegistrationView, EmailVerificationConfirmView, DeleteAccountView, GoogleAuthView, 
    RequestLegalCodeView, LegalRegisterView, RequestTechCodeView, TechRegisterView, RequestTechCodeView, TechRegisterView,
    RequestHRCodeView, HRRegisterView)

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
    
    # ✅ New Google Route
    path('google/',  GoogleAuthView.as_view(), name='google-auth'),
    # New admin registration flow
    path('request-admin-code', RequestAdminVerificationCodeView.as_view(), name='request-admin-code'),
    path('register-admin-verified', AdminVerifiedRegistrationView.as_view(), name='admin-register-verified'),
    path('verify-email/confirm/', EmailVerificationConfirmView.as_view(), name='email_verify_confirm'),

    path('', include(router.urls)), # Include the new user routes,

    path("delete-account/", DeleteAccountView.as_view(), name="delete-account"),

    path('legal/request-code', RequestLegalCodeView.as_view(), name='legal-request-code'),
    path('legal/register', LegalRegisterView.as_view(), name='legal-register'),
    path('tech/request-code', RequestTechCodeView.as_view(), name='tech-request-code'),
    path('tech/register', TechRegisterView.as_view(), name='tech-register'),
    path('hr/request-code', RequestHRCodeView.as_view(), name='hr-request-code'),  # ✅ add
    path('hr/register', HRRegisterView.as_view(), name='hr-register'),

]
