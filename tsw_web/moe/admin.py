"""
Register models for moe app.
"""

from django.contrib import admin
from .models import Project, Payment

# register models
admin.site.register(Project)
admin.site.register(Payment)
