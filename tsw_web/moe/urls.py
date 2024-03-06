"""
Url routes for moe app API endpoints.
"""

from django.urls import path, include
from rest_framework import routers
from .views import ProjectListView, PaymentListView

app_name = 'moe'

router = routers.DefaultRouter()

router.register(r'moe/projects', ProjectListView, 'purchasing-moe-project')
router.register(r'moe/payments', PaymentListView, 'purchasing-moe-payment')

urlpatterns = [path('', include(router.urls))]
