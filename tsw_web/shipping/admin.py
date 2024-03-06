"""
Register models for shipping app.
"""

from django.contrib import admin
from .models import *

# register models
admin.site.register(Status)
admin.site.register(Customer)
admin.site.register(Warehouse)
admin.site.register(Shipment)
