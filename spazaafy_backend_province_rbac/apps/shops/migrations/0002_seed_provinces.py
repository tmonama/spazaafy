# spazaafy_backend_province_rbac/apps/shops/migrations/0002_seed_provinces.py

from django.db import migrations

PROVINCES = [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
    "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"
]

def seed_provinces(apps, schema_editor):
    # ✅ THE FIX: Changed 'shops' to 'core'
    Province = apps.get_model('core', 'Province') 
    for province_name in PROVINCES:
        Province.objects.get_or_create(name=province_name)

def unseed_provinces(apps, schema_editor):
    # ✅ THE FIX: Changed 'shops' to 'core' here as well
    Province = apps.get_model('core', 'Province')
    Province.objects.filter(name__in=PROVINCES).delete()

class Migration(migrations.Migration):

    dependencies = [
        # This migration depends on the 'shops' app's initial migration,
        # AND the 'core' app's initial migration where Province is defined.
        ('shops', '0001_initial'),
        ('core', '0001_initial'), 
    ]

    operations = [
        migrations.RunPython(seed_provinces, unseed_provinces),
    ]