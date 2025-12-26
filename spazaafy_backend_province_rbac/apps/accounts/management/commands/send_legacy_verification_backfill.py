from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from django.core.mail import EmailMessage
from apps.accounts.models import EmailVerificationToken, User

class Command(BaseCommand):
    help = 'One-off script: Sends a fresh verification link to OLD unverified accounts and marks them as reminded.'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        cutoff_date = now - timedelta(days=7)

        # Find users who:
        # 1. Are not active (unverified)
        # 2. Registered MORE than 7 days ago (Legacy users)
        # 3. Have 0 reminders sent (Haven't been touched by the new system yet)
        legacy_users = User.objects.filter(
            is_active=False,
            date_joined__lt=cutoff_date,
            reminders_sent_count=0
        )

        count = legacy_users.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS("No legacy unverified users found."))
            return

        self.stdout.write(self.style.WARNING(f"Found {count} legacy users. Sending emails..."))

        for user in legacy_users:
            try:
                # 1. Delete old token
                EmailVerificationToken.objects.filter(user=user).delete()
                
                # 2. Create new token (Valid for 24h)
                new_token_obj = EmailVerificationToken.objects.create(user=user)
                
                # 3. Send Email
                self.send_reminder_email(user, new_token_obj)
                
                # 4. Mark as fully reminded
                # Setting count to 3 ensures the DAILY cron job ignores them 
                # (since it filters for count < 3)
                user.reminders_sent_count = 3 
                user.last_reminder_sent_at = now
                user.save()
                
                self.stdout.write(f"Sent backfill email to {user.email}")
            
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to email {user.email}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Backfill complete. Processed {count} users."))

    def send_reminder_email(self, user, token_obj):
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        verification_url = f"{frontend_url}/verify-email/{token_obj.token}"

        message = EmailMessage(
            subject="Action Required: Verify your Spazaafy account",
            to=[user.email],
            from_email=settings.DEFAULT_FROM_EMAIL,
        )

        message.template_id = 2 

        message.merge_global_data = {
            'NAME': user.first_name if user.first_name else "User",
            'LINK': verification_url,
        }

        message.send()