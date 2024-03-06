"""
General url routes used in reticle.
"""

# import dependencies
from django.urls import path, include
from rest_framework import routers
from ..views import FailCodeListView, StepListView

# create router object
router = routers.DefaultRouter()

# define the url patterns
router.register(r'failcodes/reticle', FailCodeListView)
router.register(r'steps/reticle', StepListView)

# define list of router
general_url_patterns = [path('api/', include(router.urls))]

