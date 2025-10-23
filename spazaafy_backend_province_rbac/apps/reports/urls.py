from django.urls import path
from .views import ProvinceReportView
urlpatterns = [ path('province-summary', ProvinceReportView.as_view(), name='province-summary') ]
