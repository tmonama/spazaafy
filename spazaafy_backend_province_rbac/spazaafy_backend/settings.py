
import os
import dj_database_url
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# --- Core ---
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'dev')
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '127.0.0.1,localhost').split(',')
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Johannesburg'
USE_I18N = True
USE_TZ = True
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')

# Add this line if you are deploying on Render
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# --- Apps ---
INSTALLED_APPS = [
    'django.contrib.admin','django.contrib.auth','django.contrib.contenttypes',
    'django.contrib.sessions','django.contrib.messages','django.contrib.staticfiles',
    'rest_framework','corsheaders','drf_spectacular',
    'django.contrib.gis',            # GIS support (PostGIS)
    'django_filters',
    'apps.core','apps.accounts','apps.shops','apps.compliance','apps.support.apps.SupportConfig','apps.visits','apps.reports',
    'apps.password_reset',
    'storages',
    'anymail',
]

# --- Middleware ---
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# --- URLs / WSGI ---
ROOT_URLCONF = 'spazaafy_backend.urls'
TEMPLATES = [{
    'BACKEND':'django.template.backends.django.DjangoTemplates',
    'DIRS':[],
    'APP_DIRS':True,
    'OPTIONS': {'context_processors':[
        'django.template.context_processors.debug',
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]
WSGI_APPLICATION = 'spazaafy_backend.wsgi.application'

# --- Database ---
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL', 'postgres://spazaafy:spazaafy@db:5432/spazaafy'),
        conn_max_age=600
    )
}
# For PostGIS, you need to set the engine manually when using dj_database_url
DATABASES['default']['ENGINE'] = 'django.contrib.gis.db.backends.postgis'

# --- Auth / DRF / JWT ---
AUTH_USER_MODEL = 'accounts.User'
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend'
    ],
}

# ✅ MODIFIED: Session Timeout Logic (30 Mins)
SIMPLE_JWT = {
    # Access token lives for 30 minutes
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.environ.get('ACCESS_TOKEN_LIFETIME_MIN','30'))),
    
    # Refresh token also lives for 30 minutes to enforce strict session timeout
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=int(os.environ.get('REFRESH_TOKEN_LIFETIME_MIN','30'))),
    
    # Enable rotation: If user is active, they get a new 30min refresh token
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    
    'AUTH_HEADER_TYPES': ('Bearer',),
}

SPECTACULAR_SETTINGS = {
    'TITLE':'Spazaafy API',
    'VERSION':'1.0.0',
}

# --- Static / Media ---
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_ROOT = os.environ.get('MEDIA_ROOT', str(BASE_DIR / 'media'))

# --- CORS / CSRF (dev-friendly defaults) ---
CORS_ALLOWED_ORIGINS = [o for o in os.environ.get('CORS_ALLOWED_ORIGINS','').split(',') if o] or [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://spazaafy.co.za',
    'https://www.spazaafy.co.za',
    "https://spazaafy-frontend.onrender.com",
]
CSRF_TRUSTED_ORIGINS = [o for o in os.environ.get('CSRF_TRUSTED_ORIGINS','').split(',') if o]

# --- Email Configuration ---
#if not DEBUG:
   # EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
   # EMAIL_HOST = 'smtp-relay.brevo.com'
   # EMAIL_PORT = 587
   # EMAIL_USE_TLS = True
   # EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER") or os.getenv("BREVO_LOGIN")
   # EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD") or os.getenv("BREVO_API_KEY")
   # DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL')
#else:
   # EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
   # DEFAULT_FROM_EMAIL = 'noreply@spazaafy.com'


# --- Email Configuration (Anymail / Brevo) ---

# 1. Tell Django to use Anymail instead of standard SMTP
EMAIL_BACKEND = "anymail.backends.brevo.EmailBackend"

# 2. Configure Anymail with your API Key
ANYMAIL = {
    "BREVO_API_KEY": os.environ.get("BREVO_API_KEY"),
}

# 3. Keep your default sender
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@spazaafy.com')



# --- Frontend URL ---
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

FILE_UPLOAD_HANDLERS = [
    'django.core.files.uploadhandler.MemoryFileUploadHandler',
]

# --- AWS S3 Settings ---
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME')
AWS_S3_FILE_OVERWRITE = True
AWS_DEFAULT_ACL = None
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400', 
}
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com'

MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/'

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# --- GOOGLE AUTH CONFIGURATION ---
GOOGLE_WEB_CLIENT_ID = os.environ.get('GOOGLE_WEB_CLIENT_ID')
GOOGLE_ANDROID_CLIENT_ID = os.environ.get('GOOGLE_ANDROID_CLIENT_ID')
GOOGLE_IOS_CLIENT_ID = os.environ.get('GOOGLE_IOS_CLIENT_ID')

# List of all trusted Client IDs
GOOGLE_VALID_CLIENT_IDS = [
    cid for cid in [
        GOOGLE_WEB_CLIENT_ID, 
        GOOGLE_ANDROID_CLIENT_ID, 
        GOOGLE_IOS_CLIENT_ID
    ] if cid
]