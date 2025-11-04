from django.urls import path
from .views import ProvinceReportView, DashboardCSVExportView
urlpatterns = [ 
    path('province-summary', ProvinceReportView.as_view(), name='province-summary'), 
    path('dashboard/export-csv/', DashboardCSVExportView.as_view(), name='dashboard-export-csv'),
    ]
