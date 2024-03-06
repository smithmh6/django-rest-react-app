"""
Batch url routes for reticle.
"""

# import dependencies
from django.urls import path, include
from rest_framework import routers
from ..views import BatchListView, HighestBatchNumberView, RTTValueYTD

# create a router object
router = routers.DefaultRouter()

# define the routes
router.register(r'batches/reticle/(?P<batch_type>\w+)', BatchListView, 'rpc-batches')

# highest batch number
router.register(r'batches/highest/(?P<batch_type>\w+)', HighestBatchNumberView, 'rpc-highest-batch')

# create a list of routes
batch_url_patterns = [
    path(r'api/batches/reticle/ship/ytd-value/',RTTValueYTD.as_view()),
    path('api/', include(router.urls)),
]
