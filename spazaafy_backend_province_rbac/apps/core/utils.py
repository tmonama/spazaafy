# apps/core/utils.py
import requests
import json

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