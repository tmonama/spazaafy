# apps/password_reset/urls.py

from django.urls import path
from .views import PasswordResetRequestView, PasswordResetConfirmView

urlpatterns = [
    path('request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]