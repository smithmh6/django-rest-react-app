"""
Url routes used in dashboards app endpoints.
"""

from django.urls import path
from .views import SpendingYTD, MoeBookedYTD, CumulativeRevenue, CumulativeSpending, ARValueYTD

app_name = 'dashboards'

urlpatterns = [
    path(r'ytd-spending/', SpendingYTD.as_view()),
    path(r'moe-revenue/', MoeBookedYTD.as_view()),
    path(r'cumulative-spending/', CumulativeSpending.as_view()),
    path(r'cumulative-revenue/', CumulativeRevenue.as_view()),
    path(r'textured_ar/ytd-value/', ARValueYTD.as_view()),
]
