# spazaafy_backend_province_rbac/apps/support/urls.py

from django.urls import path, include
from rest_framework_nested import routers
from .views import TicketViewSet, MessageViewSet, RequestAssistanceView, AdminAssistanceViewSet,TechTicketViewSet


# Main router for the top-level resource (Tickets)
router = routers.DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'assistance-requests', AdminAssistanceViewSet, basename='assistance-request')
router.register(r'tech-tickets', TechTicketViewSet, basename='tech-tickets')

# Nested router for the child resource (Messages)
# It creates URLs like /tickets/{ticket_pk}/messages/
tickets_router = routers.NestedDefaultRouter(router, r'tickets', lookup='ticket')
tickets_router.register(r'messages', MessageViewSet, basename='ticket-messages')

urlpatterns = [
    path('request-assistance/', RequestAssistanceView.as_view(), name='request-assistance'),
    path('', include(router.urls)),
    path('', include(tickets_router.urls)),
]