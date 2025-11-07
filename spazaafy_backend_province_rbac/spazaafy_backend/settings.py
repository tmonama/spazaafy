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
    'apps.core','apps.accounts','apps.shops','apps.compliance','apps.support','apps.visits','apps.reports',
    'apps.password_reset',
    'storages'
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
# This block replaces your old DATABASES setting.
# It uses the DATABASE_URL from Render in production, but falls back to your
# local Docker setup if that variable isn't set.
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

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.environ.get('ACCESS_TOKEN_LIFETIME_MIN','60'))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.environ.get('REFRESH_TOKEN_LIFETIME_DAYS','7'))),
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
MEDIA_URL = '/media/'
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

# spazaafy_backend/settings.py

# --- Email Configuration (for development) ---
# In production, use a real email backend like SendGrid or AWS SES.
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'noreply@spazaafy.com'

# --- Frontend URL ---
# This is used to construct the reset link in the email
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
# DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# This will be set on Render as an environment variable
# CLOUDINARY_URL = os.getenv('CLOUDINARY_URL')


# --- Email Configuration (Production with Brevo) ---
if not DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = 'smtp-relay.brevo.com'
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    # This reads the EMAIL_HOST_USER variable from your .env file
    EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
    # This reads the EMAIL_HOST_PASSWORD variable from your .env file
    EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
    # This reads the DEFAULT_FROM_EMAIL variable from your .env file
    DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL')

FILE_UPLOAD_HANDLERS = [
    'django.core.files.uploadhandler.MemoryFileUploadHandler',
]

# --- ADD THESE NEW AWS S3 SETTINGS ---
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME')
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400', # Cache files for 1 day
}
# This points to your S3 bucket for all media file uploads
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
