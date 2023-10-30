from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views
from .views import PackageViewSet, MovieViewSet, SubscriptionViewSet, ClientViewsSet

router = DefaultRouter()


router.register(r'clients', ClientViewsSet)
router.register(r'packages', PackageViewSet)
router.register(r'movies', MovieViewSet)
router.register(r'subscriptions', SubscriptionViewSet)


urlpatterns = [
    path("", views.index, name="index"),
    path("api/", include(router.urls)),
]