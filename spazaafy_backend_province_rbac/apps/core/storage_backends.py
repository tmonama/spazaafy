# apps/core/storage_backends.py

from storages.backends.s3boto3 import S3Boto3Storage

class PrivateMediaStorage(S3Boto3Storage):
    """
    This custom storage class forces the use of pre-signed URLs for all media files.
    This bypasses any potential issues with settings not being loaded correctly.
    """
    # This forces the generation of temporary, authenticated URLs.
    querystring_auth = True
    
    # You can set the expiry time here (e.g., 1 hour in seconds).
    querystring_expire = 3600
    
    # This ensures that new uploads are private by default.
    default_acl = 'private'