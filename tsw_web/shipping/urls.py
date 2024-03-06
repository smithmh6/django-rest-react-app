"""
Url routes for shipping app endpoints.
"""

from django.urls import path, include
from rest_framework import routers
from .views import (CustomerListView,
                    WarehouseListView,
                    StatusListView,
                    OpenShipmentListView,
                    ShipmentPartsView,
                    ShipmentListView)

app_name = 'shipping'

router = routers.DefaultRouter()

router.register(r'customers', CustomerListView, 'purchasing-customer')
router.register(r'warehouses', WarehouseListView, 'purchasing-warehouses')
router.register(r'statuses', StatusListView, 'shipping-statuses')
router.register(r'shipments/open', OpenShipmentListView, 'purchasing-shipments-open')
router.register(r'shipments/(?P<id>\d+)/parts', ShipmentPartsView, 'purchasing-shipments-open')
router.register(r'shipments', ShipmentListView, 'purchasing-shipments')

urlpatterns = [
    path('', include(router.urls))
               ]
