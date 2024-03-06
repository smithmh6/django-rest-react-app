"""
Custom Authentication class which makes a call to
Microsoft Graph API once a token is received from
the frontend request header.
"""

# import dependencies
from django.contrib.auth.models import User
import json
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import requests


class MicrosoftGraphAPIAuthentication(BaseAuthentication):
    """
    Authentication class which retrieves an email from
    MSAL token sent from frontend, validates with MS Graph API,
    then returns the authentication status.
    """

    def authenticate(self, request):
        """
        Authenticate the user by looking up the user's
        email address in the auth table.
        """

        # retrieve token from request header
        token = request.META.get('HTTP_AUTHORIZATION', None)

        # if token is found, request to graph API
        if token:

            # make call to graph API
            graph = requests.get(
                'https://graph.microsoft.com/v1.0/me/',
                headers={"Authorization": f"Bearer {token}"})

            # convert to json object
            result = json.loads(graph.text)

            # get email from graph response
            email = result.get('mail', None)

            try:
                # lookup email address in Auth user table
                user = User.objects.get(email=email)

            except User.DoesNotExist:
                raise AuthenticationFailed(f'Email address {email} not found.')

            return (user, None)