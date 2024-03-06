"""
Views for managing projects in the purchasing app.
"""

from rest_framework.viewsets import ModelViewSet
from ..models import Group, Project, Category
from ..serializers import GroupSerializer, ProjectSerializer, CategorySerializer

class GroupListView(ModelViewSet):
    """
    """
    serializer_class = GroupSerializer
    queryset = Group.objects.all().order_by('code')

class ProjectListView(ModelViewSet):
    """
    """
    serializer_class = ProjectSerializer
    queryset = Project.objects.all().order_by('name')

class CategoryListView(ModelViewSet):
    """
    """
    serializer_class = CategorySerializer
    queryset = Category.objects.all().order_by('description')
