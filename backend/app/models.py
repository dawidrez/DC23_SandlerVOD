from django.db import models

class RoleTypes(models.TextChoices):
    ADMIN = 'admin'
    CLIENT = 'client'

class GenderTypes(models.TextChoices):
    MALE = 'male'
    FEMALE = 'female'
    OTHER = 'other'

class Client(models.Model):
    first_name = models.CharField(max_length=255)
    second_name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    role = models.CharField(max_length=255, choices=RoleTypes.choices, default=RoleTypes.CLIENT)
    gender = models.CharField(max_length=255, choices=GenderTypes.choices, default=GenderTypes.OTHER)
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=255)

    def __str__(self):
        return self.email

class Package(models.Model):
    name = models.CharField(max_length=255, unique=True)
    price = models.CharField(max_length=255)
    movies = models.ManyToManyField('Movie', related_name='packages')

    def __str__(self):
        return self.name

class  Subscription(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.client.email + ' ' + self.package.name

class Movie(models.Model):
    title = models.CharField(max_length=255, unique=True)
    description = models.CharField(max_length=255)
    genre = models.CharField(max_length=255)
    release_year = models.PositiveSmallIntegerField()
    rating = models.DecimalField(max_digits=3, decimal_places=1)

    def __str__(self):
        return self.name

