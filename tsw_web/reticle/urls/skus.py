"""
url routes for managing sku objects in reticle.
"""

# import dependencies
from django.urls import path, include
from rest_framework import routers
from ..views import SkuListView, FPSkuShippablePartsView

# create a router object
router = routers.DefaultRouter()

# define the url patterns
router.register(r'skus/reticle/(?P<sku_type>\w+)', SkuListView, 'sku-list')

# define list of patterns
sku_url_patterns = [path(r'api/skus/reticle/finalproduct/<id>/parts/shippable/', FPSkuShippablePartsView.as_view(), name='reticle-fp-sku-shippable-parts'),
                    path('api/', include(router.urls))]