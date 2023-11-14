from rest_framework import serializers

from .models import Subscription, Package, Movie, Client


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = (
            "id",
            "email",
            "first_name",
            "second_name",
            "gender",
            "street_address",
            "city",
        )

    def create(self, validate_data):
        return Client.objects.create_user(**validate_data)


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = "__all__"


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = "__all__"


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = "__all__"


class UpdateSubscriptionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Subscription
        fields = (
            "id",
            "client",
            "package",
            "start_date",
            "end_date",
        )
        read_only_fields = (
            "id",
            "client",
            "start_date",
            "package",
        )


class GenerateReportSerializer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    format = serializers.ChoiceField(choices=["odt", "docx",])
