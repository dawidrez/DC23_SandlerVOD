from rest_framework import authentication
from rest_framework import exceptions

from app.models import Client


class ClientEmailAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        email = request.META.get('HTTP_X_EMAIL')
        if not email:
            return None

        try:
            client = Client.objects.get(email=email)
        except Client.DoesNotExist:
            raise exceptions.AuthenticationFailed('Set email X-EMAIL HTTP header to email of existing client')

        return client, None
