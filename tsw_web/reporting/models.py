from django.db import models
"""Models for reporting app."""

from django.db.models import ForeignKey, CharField, DateTimeField, TextField, Model, PROTECT
from django.conf import settings

class MaintenanceRequest(Model):
    title = CharField(max_length=100)
    description = TextField(null=True)
    category = CharField(max_length=25, )
    priority = CharField(max_length=25, choices=[
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("CRITICAL", "Critial"),
    ])
    created_by = ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=PROTECT,
        null=True,
        to_field='username'
    )
    created = DateTimeField(auto_now_add=True)

class GeneralNote(models.Model):
    """
    Model for general fabrication notes
    """
    name = CharField(max_length=50, unique=True)
    text = TextField()
    modified = DateTimeField(auto_now=True)
    last_modified_by = ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=PROTECT,
        null=True,
        to_field='username'
    )
