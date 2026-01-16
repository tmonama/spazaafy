from django.urls import path
from .views import PublicLegalSubmissionView

urlpatterns = [
    # Endpoint: POST /api/legal/submit/
    path('', PublicLegalSubmissionView.as_view(), name='legal-public-submit'),
]