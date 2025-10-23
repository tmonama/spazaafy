from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.core.models import Province

class User(AbstractUser):
    class Roles(models.TextChoices):
        CONSUMER="CONSUMER","Consumer"
        OWNER="OWNER","Spaza Owner"
        ADMIN="ADMIN","Admin"
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.CONSUMER)
    phone = models.CharField(max_length=30, blank=True)
    province = models.ForeignKey(Province, null=True, blank=True, on_delete=models.SET_NULL,
        help_text='If set for ADMIN, user is a Province Admin. If null and ADMIN, user is Global Admin.')
