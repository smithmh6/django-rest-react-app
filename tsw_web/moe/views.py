"""
API views for moe enpoints.
"""

from rest_framework.viewsets import ModelViewSet
from .models import Project, Payment
from .serializers import ProjectSerializer, PaymentSerializer

class ProjectListView(ModelViewSet):
    """
    API list view for moe Projects.
    """
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()

class PaymentListView(ModelViewSet):
    """
    API list view for moe Payments.
    """
    serializer_class = PaymentSerializer
    queryset = Payment.objects.all()
