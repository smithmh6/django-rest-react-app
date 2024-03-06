"""
Urls for special cases where batches need to
be 'initialized'.
"""

# import dependencies
from django.urls import path, include
from rest_framework import routers
from ..views import (ReworkPlateListView,
                     InitPhotoPlateListView,
                     InitDicePartListView)

# create url router object
router = routers.DefaultRouter()


# define the routes
router.register(
    r'batches/reticle/(?P<batch_type>\w+)/(?P<batch_id>\d+)/rework',
    ReworkPlateListView, 'rpc-rw-plates')

router.register(
    r'batches/reticle/(?P<batch_type>\w+)/(?P<batch_id>\d+)/init_photo',
    InitPhotoPlateListView, 'rpc-photo-plates')

router.register(
    r'batches/reticle/(?P<batch_type>\w+)/(?P<batch_id>\d+)/init_dice',
    InitDicePartListView, 'rpc-dice-parts')

# create list of init url routes
init_url_patterns = [path('api/', include(router.urls))]
