"""
URL routes for MaintenanceRequest objects
"""

# import dependencies
from django.urls import path, include
from rest_framework import routers
from .views import MaintenanceRequestViewSet, GeneralNoteListView

# create a router object
router = routers.DefaultRouter()

# define the url patterns
router.register(r'reporting/maintenance-requests', MaintenanceRequestViewSet, 'maintenance-requests')
router.register(r'reporting/general-notes', GeneralNoteListView, 'general-note')

# define list of patterns
urlpatterns = [path('api/', include(router.urls))]
