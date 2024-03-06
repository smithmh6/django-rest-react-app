"""
Serializers for purchase items and requests.
"""

from rest_framework.serializers import ModelSerializer
from ..models import Project, Category, Group

class ProjectSerializer(ModelSerializer):
    """
    Serializer for Projects objects.
    """

    class Meta:
        model = Project
        fields = '__all__'

class CategorySerializer(ModelSerializer):
    """
    Serializer for Projects objects.
    """

    class Meta:
        model = Category
        fields = '__all__'

class GroupSerializer(ModelSerializer):
    """
    Serializer for Projects objects.
    """

    class Meta:
        model = Group
        fields = '__all__'
