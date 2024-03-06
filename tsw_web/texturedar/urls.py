"""
This module contains url paths for the texturedar.
"""

# import dependencies
from django.urls import path, include
from .views import *
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'batches/textured_ar/open', OpenBatchListView, 'tar-batches-open')
router.register(r'batches/textured_ar', BatchListView, 'tar-batches')
router.register(r'batches/textured_ar/(?P<id>\d+)/parts', PartListView, 'tar-parts')
router.register(r'failcodes/textured_ar', ArFailcodeListView, 'tar-failcodes')
router.register(r'steps/textured_ar', ArStepListView, 'tar-steps')
router.register(r'skus/textured_ar/vendor', VendorSkuListView, 'tar-vendor-sku')
router.register(r'skus/textured_ar/rawmaterial', RawMaterialSkuListView, 'tar-raw-material-sku')
router.register(r'skus/textured_ar/opticalcoat', OpticalCoatSkuListView, 'tar-optical-coat-sku')
router.register(r'skus/textured_ar/finalproduct', FinalProductSkuListView, 'tar-optical-coat-sku')
router.register(r'categories/textured_ar', ProductCategoryListView, 'tar-product-categories')

# set the app name
app_name = 'texturedar'

# define URL routes for texturedar
urlpatterns = [
    path(r'api/batches/textured_ar/highest/', HighestBatchView.as_view(), name='tar-batches-highest'),
    path(r'api/skus/textured_ar/opticalcoat/<id>/parts/shippable/', OCSkuShippablePartsView.as_view(), name='tar-optical-coat-sku-shippable-parts'),
    path(r'api/skus/textured_ar/finalproduct/<id>/parts/shippable/', FPSkuShippablePartsView.as_view(), name='tar-final-product-sku-shippable-parts'),
    path(r'api/textured_ar/riesystems/', RieSystemView.as_view()),
    path(r'api/textured_ar/etchrecipes/', EtchRecipeView.as_view()),
    path(r'api/textured_ar/rietoolings/', RieToolingView.as_view()),
    path('api/', include(router.urls)),
    path(r'api/batches/textured_ar/<ar_batch_id>/parts/performance', PartPerformanceAPIView.as_view(), name='tar-parts-performance'),
]