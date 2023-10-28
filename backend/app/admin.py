from django.contrib import admin

from app.models import Client, Package, Subscription, Movie

admin.site.register(Client)
admin.site.register(Package)
admin.site.register(Subscription)
admin.site.register(Movie)