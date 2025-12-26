from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from apps.compliance.models import Document, DocumentStatus

class Command(BaseCommand):
    help = 'Deletes rejected documents (30 days old) and expired documents (31 days past expiry) from S3 and Database'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        
        # 1. Logic for Rejected Docs (30 days since last update)
        rejected_cutoff = now - timedelta(days=30)
        
        # 2. Logic for Expired Docs (31 days past expiry date)
        # We use .date() because expiry_date is a DateField
        expired_cutoff = now.date() - timedelta(days=31)

        # 3. Find documents matching EITHER condition
        docs_to_delete = Document.objects.filter(
            Q(status=DocumentStatus.REJECTED, updated_at__lt=rejected_cutoff) |
            Q(expiry_date__isnull=False, expiry_date__lt=expired_cutoff)
        ).distinct()

        count = docs_to_delete.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS("No old rejected or expired documents found to delete."))
            return

        self.stdout.write(self.style.WARNING(f"Found {count} documents to cleanup..."))

        for doc in docs_to_delete:
            try:
                # Determine reason for logging
                doc_id = doc.id
                file_name = doc.file.name if doc.file else "No File"
                
                reason = "Unknown"
                if doc.status == DocumentStatus.REJECTED and doc.updated_at < rejected_cutoff:
                    reason = "REJECTED (>30 days)"
                elif doc.expiry_date and doc.expiry_date < expired_cutoff:
                    reason = f"EXPIRED (on {doc.expiry_date})"

                # Delete the file from S3 explicitly
                if doc.file:
                    doc.file.delete(save=False)
                
                # Delete the database record
                doc.delete()
                
                self.stdout.write(f"Deleted [{reason}] ID: {doc_id} - File: {file_name}")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error deleting document {doc.id}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS(f"Cleanup complete. Successfully deleted {count} documents."))