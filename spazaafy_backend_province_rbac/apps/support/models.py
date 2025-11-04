from django.db import models
from django.conf import settings
from uuid import uuid4  # <--- ADD THIS LINE
from apps.core.models import Province

# ✅ 1. Add a new TextChoices class for Priority
class TicketPriority(models.TextChoices):
    LOW = "LOW", "Low"
    MEDIUM = "MEDIUM", "Medium"
    HIGH = "HIGH", "High"
    URGENT = "URGENT", "Urgent"

class TicketStatus(models.TextChoices):
    OPEN="OPEN","Open"; IN_PROGRESS="IN_PROGRESS","In Progress"; RESOLVED="RESOLVED","Resolved"; CLOSED="CLOSED","Closed"

class Ticket(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets')
    title = models.CharField(max_length=255)
    province = models.ForeignKey(Province, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=TicketStatus.choices, default=TicketStatus.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta: ordering=['-created_at']

    # ✅ 2. Add the new priority field to the model
    priority = models.CharField(
        max_length=20,
        choices=TicketPriority.choices,
        default=TicketPriority.LOW
    )

# --- ADD THIS NEW MODEL CLASS AT THE END OF THE FILE ---
class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    attachment = models.FileField(upload_to='ticket_attachments/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender} on ticket {self.ticket.id}"