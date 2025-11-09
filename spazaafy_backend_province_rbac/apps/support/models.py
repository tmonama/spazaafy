from django.db import models
from django.conf import settings
from uuid import uuid4
from apps.core.models import Province
from django.db.models.signals import post_save # ✅ 1. Import signals
from django.dispatch import receiver          # ✅ 2. Import receiver decorator

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
    
    # ✅ 3. Add the new unread status fields
    unread_for_creator = models.BooleanField(default=False)
    unread_for_assignee = models.BooleanField(default=True) # Default to true so admin sees it on creation

    class Meta: 
        ordering=['-created_at']

    priority = models.CharField(
        max_length=20,
        choices=TicketPriority.choices,
        default=TicketPriority.LOW
    )

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

# ✅ 4. This is the signal handler. It runs automatically after a Message is saved.
@receiver(post_save, sender=Message)
def update_ticket_unread_status(sender, instance, created, **kwargs):
    if created:
        ticket = instance.ticket
        message_sender = instance.sender
        ticket_creator = ticket.user
        
        # If the person who sent the message is the ticket's original creator...
        if message_sender == ticket_creator:
            # ...then it's a new message for the admin to read.
            ticket.unread_for_assignee = True
            ticket.unread_for_creator = False # The creator just wrote it, so it's not unread for them.
        else:
            # ...otherwise, an admin replied, so it's a new message for the creator.
            ticket.unread_for_creator = True
            ticket.unread_for_assignee = False # The admin just wrote it.
        
        # Also update the ticket's main timestamp to bring it to the top of lists
        ticket.updated_at = instance.created_at
        
        ticket.save(update_fields=['unread_for_creator', 'unread_for_assignee', 'updated_at'])

# ✅ 5. This signal marks the ticket as read for the appropriate user when they view it.
# We will create a new action in the viewset to trigger this.
def mark_ticket_as_read(ticket, user):
    if user == ticket.user:
        # The creator is viewing it, so mark it as read for them.
        if ticket.unread_for_creator:
            ticket.unread_for_creator = False
            ticket.save(update_fields=['unread_for_creator'])
    elif user.is_staff:
        # An admin is viewing it, so mark it as read for them.
        if ticket.unread_for_assignee:
            ticket.unread_for_assignee = False
            ticket.save(update_fields=['unread_for_assignee'])