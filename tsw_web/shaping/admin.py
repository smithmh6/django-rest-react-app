"""
Register models for moe app.
"""

from django.contrib import admin
from .models import *

# register models
admin.site.register(ServiceType)
admin.site.register(Service)