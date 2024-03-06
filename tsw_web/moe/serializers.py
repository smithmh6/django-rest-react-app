"""
Serializers for moe app.
"""

from rest_framework.serializers import ModelSerializer
from .models import Project, Payment

class ProjectSerializer(ModelSerializer):
    """
    Serailize MoeProject objects.
    """

    class Meta:
        model = Project
        fields= '__all__'

class PaymentSerializer(ModelSerializer):
    """
    Serailize MoePayment objects.
    """

    class Meta:
        model = Payment
        fields= '__all__'