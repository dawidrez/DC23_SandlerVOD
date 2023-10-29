from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .authentication import ClientEmailAuthentication
from .models import Package, Movie, Subscription, Client
from .serializers import SubscriptionSerializer, PackageSerializer, MovieSerializer, ClientSerializer


@api_view(('GET',))
def index(request):
    return Response({"message": "Server is running"}, status.HTTP_200_OK)


class ClientViewsSet(viewsets.ViewSet):
    authentication_classes = [ClientEmailAuthentication]

    queryset = Client.objects.all()
    serializer_class = ClientSerializer

    def list(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "Not authenticated"}, status.HTTP_401_UNAUTHORIZED)
        elif not request.user.is_superuser:
            return Response(self.serializer_class((request.user, ), many=True).data, status.HTTP_200_OK)
        return Response(self.serializer_class(Client.objects.all(), many=True).data, status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        request.data.update({"password": "non-trivial-password-123"})
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status.HTTP_201_CREATED)


class PackageViewSet(viewsets.ViewSet):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer

    def list(self, request, *args, **kwargs):
        serializer = self.serializer_class(Package.objects.all(), many=True)
        return Response(serializer.data, status.HTTP_200_OK)

    def retrieve(self, request, pk, *args, **kwargs):
        serializer = self.serializer_class(get_object_or_404(self.queryset, pk=pk))
        return Response(serializer.data, status.HTTP_200_OK)


class MovieViewSet(viewsets.ViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer

    def list(self, request, *args, **kwargs):
        serializer = self.serializer_class(Movie.objects.all(), many=True)
        return Response(serializer.data, status.HTTP_200_OK)

    def retrieve(self, request, pk, *args, **kwargs):
        serializer = self.serializer_class(get_object_or_404(self.queryset, pk=pk))
        return Response(serializer.data, status.HTTP_200_OK)


class SubscriptionViewSet(viewsets.ViewSet):
    authentication_classes = [ClientEmailAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer

    def list(self, request, *args, **kwargs):
        if request.user.is_superuser:
            serializer = self.serializer_class(Subscription.objects.all(), many=True)
        else:
            serializer = self.serializer_class(Subscription.objects.filter(client=self.request.user), many=True)
        return Response(serializer.data, status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        request.data.update({"client": self.request.user.pk})
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status.HTTP_201_CREATED)
