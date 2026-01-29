# apps/core/utils.py
import requests
import json
import logging
import socket
from django.core.mail import EmailMessage, get_connection
from django.conf import settings
from requests.exceptions import ReadTimeout, ConnectionError

logger = logging.getLogger(__name__)

def send_expo_push_notification(user, title, body, data=None):
    """
    Sends a push notification to the user's stored Expo Push Token.
    """
    token = getattr(user, 'expo_push_token', None)
    
    if not token:
        print(f"No push token found for user {user.email}")
        return

    # Check if token looks valid (starts with ExponentPushToken)
    if not token.startswith("ExponentPushToken"):
        print(f"Invalid Expo Token for {user.email}")
        return

    url = "https://exp.host/--/api/v2/push/send"
    headers = {
        "host": "exp.host",
        "accept": "application/json",
        "accept-encoding": "gzip, deflate",
        "content-type": "application/json"
    }
    
    payload = {
        "to": token,
        "title": title,
        "body": body,
        "sound": "default",
        "data": data or {} # Extra data (like ticket ID) to handle taps later
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        print(f"Push sent to {user.email}: {response.status_code}")
    except Exception as e:
        print(f"Push notification failed: {e}")

def send_email_with_fallback(subject, recipient_list, template_id=None, context_data=None, backup_body=None):
    """
    Attempts to send email via Brevo (Primary). 
    If it fails due to timeout/connection issues, it falls back to:
    1. Console Logs (if USE_CONSOLE_ON_FAIL is True) - Allows Admin to see OTPs in Render logs.
    2. Backup SMTP (if configured) - e.g., a Gmail account.
    """
    if context_data is None:
        context_data = {}

    # 1. Try Primary Provider (Brevo)
    try:
        print(f"📧 [Email] Attempting to send '{subject}' via Brevo...")
        msg = EmailMessage(
            subject=subject, 
            to=recipient_list,
            from_email=settings.DEFAULT_FROM_EMAIL
        )
        if template_id:
            msg.template_id = template_id
            msg.merge_global_data = context_data
        elif backup_body:
             msg.body = backup_body
        
        msg.send()
        print("✅ [Email] Sent successfully via Brevo.")
        return True

    except (ReadTimeout, ConnectionError, socket.timeout, Exception) as e:
        print(f"❌ [Email] Brevo Failed: {e}")
        print("🔄 [Email] Switching to Fallback mechanism...")

        # Construct backup content
        if not backup_body:
            backup_body = f"Subject: {subject}\n\n"
            for key, value in context_data.items():
                backup_body += f"{key}: {value}\n"
            backup_body += "\n(Sent via System Backup)"

        # 2. Check settings for Fallback Strategy
        use_console = getattr(settings, 'USE_CONSOLE_ON_FAIL', False)
        
        if use_console:
            # OPTION A: Print to Server Logs (Reliable for Dev/Admins)
            print("\n" + "="*50)
            print(f"⚠️  FALLBACK EMAIL LOG (Provider Down)  ⚠️")
            print(f"To: {recipient_list}")
            print(f"Subject: {subject}")
            print("-" * 20)
            print(backup_body)
            print("="*50 + "\n")
            return True
        else:
            # OPTION B: Use Backup SMTP (e.g. Gmail)
            try:
                # Ensure these are set in settings.py or environment variables
                backup_user = getattr(settings, 'EMAIL_BACKUP_USER', None)
                backup_password = getattr(settings, 'EMAIL_BACKUP_PASSWORD', None)

                if not backup_user or not backup_password:
                    print("❌ [Email] No backup SMTP credentials found. Cannot send fallback email.")
                    return False

                backup_conn = get_connection(
                    host='smtp.gmail.com', 
                    port=587, 
                    username=backup_user, 
                    password=backup_password, 
                    use_tls=True
                )
                
                msg = EmailMessage(
                    subject=f"[Backup] {subject}",
                    body=backup_body,
                    from_email=backup_user,
                    to=recipient_list,
                    connection=backup_conn
                )
                msg.send()
                print("✅ [Email] Sent via Backup SMTP (Gmail).")
                return True

            except Exception as backup_error:
                print(f"❌ [Email] Backup SMTP Failed: {backup_error}")
                return False