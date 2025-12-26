# apps/accounts/management/commands/send_verification_reminders.py

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from django.core.mail import EmailMessage
from apps.accounts.models import EmailVerificationToken, User # ✅ Import User model

class Command(BaseCommand):
    help = 'Sends reminder emails to unverified users 1, 3, and 7 days after registration.'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        
        # Filter for users who are NOT active and have NOT exceeded 3 reminders
        # We also check their original date_joined for the 1-day reminder
        users_to_remind = User.objects.filter(
            is_active=False, 
            reminders_sent_count__lt=3 # We want to send 3 reminders max
        ).order_by('date_joined') # Process oldest first

        count_sent = 0

        for user in users_to_remind:
            days_since_joined = (now - user.date_joined).days
            
            # Conditions for sending reminders
            send_reminder_now = False
            reminder_type = None

            if days_since_joined >= 1 and user.reminders_sent_count == 0:
                send_reminder_now = True
                reminder_type = "1-day"
            elif days_since_joined >= 3 and user.reminders_sent_count == 1:
                send_reminder_now = True
                reminder_type = "3-day"
            elif days_since_joined >= 7 and user.reminders_sent_count == 2:
                send_reminder_now = True
                reminder_type = "7-day"
            
            # Prevent sending multiple reminders within a day (e.g. if cron runs multiple times)
            if user.last_reminder_sent_at and (now - user.last_reminder_sent_at).total_seconds() < (23 * 3600):
                 # Skip if a reminder was sent very recently
                 send_reminder_now = False
                 self.stdout.write(f"Skipping {user.email}: A reminder was sent less than 23 hours ago.")

            if send_reminder_now:
                try:
                    # ✅ 1. Delete any existing token for this user
                    EmailVerificationToken.objects.filter(user=user).delete()
                    # ✅ 2. Create a brand new token
                    new_token_obj = EmailVerificationToken.objects.create(user=user)
                    
                    self.send_reminder_email(user, new_token_obj, reminder_type)
                    
                    # ✅ 3. Update user's reminder state
                    user.reminders_sent_count += 1
                    user.last_reminder_sent_at = now
                    user.save()
                    count_sent += 1
                    self.stdout.write(f"Sent {reminder_type} reminder to {user.email}")

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to send {reminder_type} reminder email to {user.email}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Done. Sent {count_sent} reminder emails."))

    def send_reminder_email(self, user, token_obj, reminder_type):
        """
        Sends the account verification reminder email with a new link.
        """
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        verification_url = f"{frontend_url}/verify-email/{token_obj.token}"

        # Customize subject slightly for reminders if desired, or let Brevo template handle it
        subject_prefix = f"ACTION REQUIRED: " if reminder_type == "7-day" else "Reminder: "
        subject = f"{subject_prefix}Please verify your Spazaafy account" 

        message = EmailMessage(
            subject=subject,
            to=[user.email],
            from_email=settings.DEFAULT_FROM_EMAIL,
        )

        message.template_id = 7 # Assuming this is your account verification template

        message.merge_global_data = {
            'NAME': user.first_name if user.first_name else "User",
            'LINK': verification_url,
            # You could add a REMINDER_COUNT variable to the template if it exists
            'REMINDER_TEXT': f"This is your {reminder_type} reminder." 
        }

        message.send()