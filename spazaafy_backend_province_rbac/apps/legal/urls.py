# apps/legal/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicLegalSubmissionView, LegalAdminViewSet, SubmitAmendmentView

# Admin Router
router = DefaultRouter()
router.register(r'requests', LegalAdminViewSet, basename='legal-admin')

urlpatterns = [
    # 1. Public Submission (POST /api/legal/submit/)
    path('submit/', PublicLegalSubmissionView.as_view(), name='legal-public-submit'),

    # 2. Public Amendment Upload (PUT /api/legal/public/upload-amendment/<token>/)
    # This matches the link sent in the email
    path('public/upload-amendment/<uuid:amendment_token>/', SubmitAmendmentView.as_view(), name='legal-submit-amendment'),

    # 3. Admin Routes (Prefix: /api/legal/admin/...)
    path('admin/', include(router.urls)),
]