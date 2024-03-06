"""
Serializers for status items in purchasing app.
"""

from rest_framework.serializers import ModelSerializer
from ..models import (AccountType,
                      ProjectStatus,
                      ApprovalStatus,
                      ItemStatus,
                      RequestStatus)

class AccountTypeSerializer(ModelSerializer):
    """
    Serialize account type objects.
    """

    class Meta:
        model = AccountType
        fields = '__all__'

class ProjectStatusSerializer(ModelSerializer):
    """
    Serialize project status objects.
    """

    class Meta:
        model = ProjectStatus
        fields = '__all__'

class ApprovalStatusSerializer(ModelSerializer):
    """
    Serialize approval status objects.
    """

    class Meta:
        model = ApprovalStatus
        fields = '__all__'

class ItemStatusSerializer(ModelSerializer):
    """
    Serialize Item status objects.
    """

    class Meta:
        model = ItemStatus
        fields = '__all__'

class RequestStatusSerializer(ModelSerializer):
    """
    Serialize Request status objects.
    """

    class Meta:
        model = RequestStatus
        fields = '__all__'
