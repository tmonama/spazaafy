from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicHiringRequestView, PublicJobApplicationView, PublicTrainingSignupView,
    HiringRequestViewSet, JobApplicationViewSet, EmployeeViewSet, TrainingViewSet,
    PublicJobDetailView, PublicTrainingDetailView, HRComplaintViewSet, 
    EmployeePortalViewSet, EmployeeRegistrationView
)

# --- Admin Router (Prefix: /api/hr/admin/...) ---
router = DefaultRouter()
router.register(r'hiring', HiringRequestViewSet, basename='hr-hiring')
router.register(r'applications', JobApplicationViewSet, basename='hr-applications')
router.register(r'employees', EmployeeViewSet, basename='hr-employees')
router.register(r'training', TrainingViewSet, basename='hr-training')
router.register(r'admin/complaints', HRComplaintViewSet, basename='hr-complaints')

# --- Employee Portal Router (Prefix: /api/hr/portal/...) ---
portal_router = DefaultRouter()
portal_router.register(r'', EmployeePortalViewSet, basename='hr-portal')

urlpatterns = [
    # --- Public Endpoints ---
    path('public/request-hiring/', PublicHiringRequestView.as_view()),
    path('public/apply/', PublicJobApplicationView.as_view()),
    path('public/training-signup/', PublicTrainingSignupView.as_view()),
    path('public/jobs/<uuid:pk>/', PublicJobDetailView.as_view()),
    path('public/training/<uuid:pk>/', PublicTrainingDetailView.as_view()),

    # --- Employee Auth (Explicit Paths to match Frontend) ---
    # This fixes the 404 by exposing exactly what the frontend is calling
    path('auth/employee/request_access/', EmployeeRegistrationView.as_view({'post': 'request_access'})),
    path('auth/employee/complete_registration/', EmployeeRegistrationView.as_view({'post': 'complete_registration'})),

    # --- Employee Portal ---
    path('portal/', include(portal_router.urls)),
    
    # --- Admin Endpoints ---
    path('admin/', include(router.urls)),
]