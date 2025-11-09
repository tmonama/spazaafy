from django.apps import AppConfig

class SupportConfig(AppConfig):
    default_auto_field='django.db.models.BigAutoField'
    name='apps.support'

    # ✅ ADD THIS METHOD
    def ready(self):
        """
        This method is called when Django starts.
        Importing signals here ensures they are registered and ready to listen for events.
        """
        import apps.support.models  # This line registers the signals from your models.py