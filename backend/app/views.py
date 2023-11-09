import threading
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .authentication import ClientEmailAuthentication
from .models import Package, Movie, Subscription, Client
from .serializers import SubscriptionSerializer, PackageSerializer, MovieSerializer, ClientSerializer, UpdateSubscriptionSerializer
from .utils.invoice_utils import generate_invoice_xml, generate_invoice_html, generate_invoice_pdf
from .utils.google.drive_utils import check_folder_exists, upload_file


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

    def update(self, request, pk, *args, **kwargs):
        client = get_object_or_404(self.queryset, pk=pk)
        user = request.user
        if not user.is_superuser:
            return Response({"detail": "This action is forbidden"}, status.HTTP_403_FORBIDDEN)
        serializer = self.serializer_class(client, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status.HTTP_200_OK)

    def partial_update(self, request, pk, *args, **kwargs):
        client = get_object_or_404(self.queryset, pk=pk)
        user = request.user
        if not user.is_superuser:
            return Response({"detail": "This action is forbidden"}, status.HTTP_403_FORBIDDEN)
        serializer = self.serializer_class(client, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status.HTTP_200_OK)

    @action(detail=False, methods=['GET'])
    def is_admin(self, request, *args, **kwargs):
        user = request.user
        if user.is_superuser:
            return Response({"is_admin": True}, status=status.HTTP_200_OK)
        return Response({"is_admin": False}, status=status.HTTP_200_OK)


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
        subscription = serializer.save()
        invoice_xml, invoice_filename = generate_invoice_xml(subscription)
        invoice_html = generate_invoice_html(invoice_xml, subscription.client)
        generate_invoice_pdf(invoice_xml)
        print(invoice_xml)
        print(invoice_html)
        
        client_folder_id = check_folder_exists(subscription.client.email)

        upload_thread = threading.Thread(target=upload_file, args=(invoice_filename, client_folder_id), kwargs={"clean_up": True})
        upload_thread.start()

        return Response(serializer.data, status.HTTP_201_CREATED)

    def partial_update(self, request, pk, *args, **kwargs):
        subscription = get_object_or_404(self.queryset, pk=pk)
        user = request.user
        if not user.is_superuser:
            return Response({"detail": "This action is forbidden"}, status.HTTP_403_FORBIDDEN)
        serializer = UpdateSubscriptionSerializer(subscription, data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_subscription = serializer.save()

        invoice_xml, invoice_filename = generate_invoice_xml(updated_subscription)
        invoice_html = generate_invoice_html(invoice_xml, updated_subscription.client)
        generate_invoice_pdf(invoice_xml)

        client_folder_id = check_folder_exists(updated_subscription.client.email)

        upload_thread = threading.Thread(target=upload_file, args=(invoice_filename, client_folder_id), kwargs={"clean_up": True})
        upload_thread.start()

        return Response(serializer.data, status.HTTP_200_OK)



