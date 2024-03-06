"""
Url routes for Plate objects in reticle.
"""

# import dependencies
from django.urls import path, include
from rest_framework import routers
from ..views import PlatesListView

# create a router object
router = routers.DefaultRouter()

# define the patterns
router.register(
    r'batches/reticle/(?P<batch_type>\w+)/(?P<batch_id>\d+)/plates',
    PlatesListView, 'rpc-plates')


# create pattern list
plate_url_patterns = [path('api/', include(router.urls))]
