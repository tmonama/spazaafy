import datetime
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from django.conf import settings
import json

# Path to the JSON key you downloaded
SERVICE_ACCOUNT_FILE = os.path.join(settings.BASE_DIR, 'service_account.json')
SCOPES = ['https://www.googleapis.com/auth/calendar']

# The ID of the calendar where events will be created
# Use 'primary' if the service account acts on its own behalf, 
# OR use the email address you shared the calendar with (e.g., 'hr@spazaafy.co.za')
CALENDAR_ID = 'spazaafy@gmail.com' # CHANGE THIS to your HR email

def get_credentials():
    # Option 1: Read from Env Var (Production)
    json_str = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')
    if json_str:
        info = json.loads(json_str)
        return service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    
    # Option 2: Read from File (Local Dev)
    file_path = os.path.join(settings.BASE_DIR, 'service_account.json')
    if os.path.exists(file_path):
        return service_account.Credentials.from_service_account_file(file_path, scopes=SCOPES)
        
    return None

def create_google_meet_event(summary, description, start_time_iso, attendee_email):
    """
    Creates a Google Calendar event with a Google Meet link.
    """
    try:
        creds = get_credentials()
        if not creds:
            print("No Google Credentials found!")
            return None
            
        service = build('calendar', 'v3', credentials=creds)

        # Parse start time and set duration (e.g., 1 hour)
        start_dt = datetime.datetime.fromisoformat(start_time_iso.replace('Z', '+00:00'))
        end_dt = start_dt + datetime.timedelta(hours=1)

        event_body = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': start_dt.isoformat(),
                'timeZone': 'Africa/Johannesburg',
            },
            'end': {
                'dateTime': end_dt.isoformat(),
                'timeZone': 'Africa/Johannesburg',
            },
            'attendees': [
                {'email': attendee_email},
            ],
            # This magic Request ID triggers Meet link generation
            'conferenceData': {
                'createRequest': {
                    'requestId': f"req-{int(datetime.datetime.now().timestamp())}",
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                }
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 10},
                ],
            },
        }

        # conferenceDataVersion=1 is REQUIRED to generate the link
        event = service.events().insert(
            calendarId=CALENDAR_ID, 
            body=event_body, 
            conferenceDataVersion=1
        ).execute()

        meet_link = event.get('hangoutLink')
        print(f"Event created: {event.get('htmlLink')}")
        print(f"Meet Link: {meet_link}")
        
        return meet_link

    except Exception as e:
        print(f"Google Calendar Error: {e}")
        return None