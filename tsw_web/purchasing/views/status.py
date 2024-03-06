"""
Views for status items and account type objects.
"""

from rest_framework.viewsets import ModelViewSet
from ..models import (ApprovalStatus,
                      ItemStatus,
                      ProjectStatus,
                      AccountType,
                      RequestStatus)
from ..serializers import (ProjectStatusSerializer,
                           ApprovalStatusSerializer,
                           ItemStatusSerializer,
                           AccountTypeSerializer,
                           RequestStatusSerializer)

class ProjectStatusListView(ModelViewSet):
    """
    """
    serializer_class = ProjectStatusSerializer
    queryset = ProjectStatus.objects.all()

class ApprovalStatusListView(ModelViewSet):
    """
    """
    serializer_class = ApprovalStatusSerializer
    queryset = ApprovalStatus.objects.all()

class ItemStatusListView(ModelViewSet):
    """
    """
    serializer_class = ItemStatusSerializer
    queryset = ItemStatus.objects.all()

class AccountTypeListView(ModelViewSet):
    """
    """
    serializer_class = AccountTypeSerializer
    queryset = AccountType.objects.all()

class RequestStatusListView(ModelViewSet):
    """
    """
    serializer_class = RequestStatusSerializer
    queryset = RequestStatus.objects.all()
