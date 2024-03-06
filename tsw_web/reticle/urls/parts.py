"""
Url routes for managing Part objects in reticle.
"""

# import dependencies
from django.urls import path, include
from rest_framework import routers
from ..views import PartsListView, PartsBatchView

# create router object
router = routers.DefaultRouter()

# define url routes
router.register(
    r'batches/reticle/(?P<batch_type>\w+)/(?P<batch_id>\d+)/plates/(?P<plate_id>\d+)/parts',
    PartsListView, 'rpc-parts')
router.register(
    r'batches/reticle/(?P<batch_type>\w+)/(?P<batch_id>\d+)/parts',
    PartsBatchView, 'rpc-parts-batch')

# define url pattern list
part_url_patterns = [path('api/', include(router.urls))]
