"""
Common view classes used across all production
routes.
"""

# import dependencies
from rest_framework.viewsets import ModelViewSet
from ..serializers import FailCodeSerializer, StepSerializer
from ..models import Fail, Step


class FailCodeListView(ModelViewSet):
    """
    Retrieve the fail codes (RESTful).
    """
    serializer_class = FailCodeSerializer
    queryset = Fail.objects.all()

class StepListView(ModelViewSet):
    """
    Retrieves RTT step codes from model.
    """
    serializer_class = StepSerializer
    queryset = Step.objects.all()