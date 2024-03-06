from rest_framework.test import APITestCase
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from ..models import *

# AuthenticatedTestCase forces client authentication for requests
class AuthenticatedTestCase(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.test_user = User.objects.create_user(username="test_user", password="password")
    
    def setUp(self):
        # Required for authorization of requests from client
        self.client.force_authenticate(self.test_user)
