from django.db import models
from django.conf import settings

class TicketStatus(models.TextChoices):
    OPEN="OPEN","Open"; IN_PROGRESS="IN_PROGRESS","In Progress"; RESOLVED="RESOLVED","Resolved"; CLOSED="CLOSED","Closed"

class Ticket(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets')
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=TicketStatus.choices, default=TicketStatus.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta: ordering=['-created_at']
