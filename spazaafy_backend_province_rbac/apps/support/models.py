from django.db import models
from django.conf import settings
from uuid import uuid4
from apps.core.models import Province
from django.db.models.signals import post_save # ✅ 1. Import signals
from django.dispatch import receiver          # ✅ 2. Import receiver decorator
from apps.shops.models import SpazaShop
import random
import string

class TicketPriority(models.TextChoices):
    LOW = "LOW", "Low"
    MEDIUM = "MEDIUM", "Medium"
    HIGH = "HIGH", "High"
    URGENT = "URGENT", "Urgent"

class TicketStatus(models.TextChoices):
    OPEN="OPEN","Open"; IN_PROGRESS="IN_PROGRESS","In Progress"; RESOLVED="RESOLVED","Resolved"; CLOSED="CLOSED","Closed"

class Ticket(models.Model):
    shop = models.ForeignKey(SpazaShop, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets')
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


class AssistanceRequest(models.Model):
    ASSISTANCE_TYPES = [
        ("CIPC_REGISTRATION", "CIPC Registration"),
        ("SARS_TAX_CLEARANCE", "SARS Tax Clearance"),
        ("HEALTH_CERTIFICATE", "Health Certificate (COA)"),
        ("TRADING_LICENSE", "Trading License"),
        ("ZONING_PERMIT", "Zoning Permit"),
        ("OTHER", "Other"),
    ]

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("REFERRED", "Referred"),
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
        ("COMMISSION_PAID", "Commission Paid"),
        ("CANCELLED", "Cancelled"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shop_name = models.CharField(max_length=255)
    assistance_type = models.CharField(max_length=50, choices=ASSISTANCE_TYPES)
    comments = models.TextField()
    reference_code = models.CharField(max_length=20, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.reference_code:
            self.reference_code = self.generate_ref_code()
        super().save(*args, **kwargs)

    def generate_ref_code(self):
        numbers = ''.join(random.choices(string.digits, k=4))
        chars = ''.join(random.choices(string.ascii_uppercase, k=2))
        return f"SPZ-{numbers}-{chars}"

    def __str__(self):
        return f"{self.reference_code} - {self.shop_name}"

# ✅ NEW: Tech Portal Models

class TechCategory(models.TextChoices):
    IT_SUPPORT = "IT_SUPPORT", "IT Support"
    ACCESS = "ACCESS", "Access / Permissions"
    BUG = "BUG", "System Bug"
    REFERRAL = "REFERRAL", "Support Referral (Escalated)"

class TechStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    INVESTIGATING = "INVESTIGATING", "Under Investigation"
    FIXING = "FIXING", "Fixing"
    RESOLVED = "RESOLVED", "Resolved / Closed"

class TechTicket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tech_requests')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tech_tickets')
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=TechCategory.choices, default=TechCategory.IT_SUPPORT)
    status = models.CharField(max_length=50, choices=TechStatus.choices, default=TechStatus.PENDING)
    
    # Analytics fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Auto-set resolved_at if status changes to RESOLVED
        if self.status == TechStatus.RESOLVED and not self.resolved_at:
            from django.utils import timezone
            self.resolved_at = timezone.now()
        elif self.status != TechStatus.RESOLVED:
            self.resolved_at = None
        super().save(*args, **kwargs)

    @property
    def resolution_time_hours(self):
        if self.resolved_at and self.created_at:
            diff = self.resolved_at - self.created_at
            return round(diff.total_seconds() / 3600, 2)
        return 0