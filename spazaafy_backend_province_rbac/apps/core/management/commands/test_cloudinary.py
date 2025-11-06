import sys
from io import BytesIO
from django.core.management.base import BaseCommand
from django.conf import settings
import cloudinary.uploader

class Command(BaseCommand):
    help = 'Tests the connection and authentication to Cloudinary.'

    def handle(self, *args, **options):
        self.stdout.write("\n--- STARTING CLOUDINARY CONNECTION TEST ---")

        # 1. Check if the CLOUDINARY_URL is even set
        if not settings.CLOUDINARY_URL:
            self.stderr.write(self.style.ERROR("ERROR: CLOUDINARY_URL is not set in the environment."))
            sys.exit(1)
        
        self.stdout.write("SUCCESS: CLOUDINARY_URL environment variable was found.")
        
        # 2. Try to perform a simple upload
        try:
            self.stdout.write("Attempting to upload a small test file to Cloudinary...")
            
            # Create a tiny in-memory file
            fake_file_content = b"This is a test file for Cloudinary connection."
            fake_file = BytesIO(fake_file_content)
            
            # Perform the upload
            result = cloudinary.uploader.upload(
                fake_file,
                public_id="spazaafy_connection_test",
                resource_type="raw", # Use 'raw' for non-image files
                overwrite=True
            )
            
            # 3. If it succeeds, print the result
            self.stdout.write(self.style.SUCCESS("\nSUCCESS! Cloudinary connection is working."))
            self.stdout.write(f"Test file uploaded successfully. URL: {result.get('secure_url')}")

        except Exception as e:
            # 4. If it fails, print the REAL error message
            self.stderr.write(self.style.ERROR("\nERROR: Cloudinary connection FAILED."))
            self.stderr.write(f"The library returned the following error: {e}")
            sys.exit(1)

        self.stdout.write("\n--- CLOUDINARY CONNECTION TEST FINISHED ---\n")