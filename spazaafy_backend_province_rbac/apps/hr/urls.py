from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicHiringRequestView, PublicJobApplicationView, PublicTrainingSignupView,
    HiringRequestViewSet, JobApplicationViewSet, EmployeeViewSet, TrainingViewSet,
    PublicJobDetailView, PublicTrainingDetailView
)

# Admin Router
router = DefaultRouter()
router.register(r'hiring', HiringRequestViewSet, basename='hr-hiring')
router.register(r'applications', JobApplicationViewSet, basename='hr-applications')
router.register(r'employees', EmployeeViewSet, basename='hr-employees')
router.register(r'training', TrainingViewSet, basename='hr-training')

urlpatterns = [
    # Public Endpoints
    path('public/request-hiring/', PublicHiringRequestView.as_view()),
    path('public/apply/', PublicJobApplicationView.as_view()),
    path('public/training-signup/', PublicTrainingSignupView.as_view()),

    path('public/jobs/<uuid:pk>/', PublicJobDetailView.as_view()),
    path('public/training/<uuid:pk>/', PublicTrainingDetailView.as_view()),
    
    # Admin Endpoints
    path('admin/', include(router.urls)),
]