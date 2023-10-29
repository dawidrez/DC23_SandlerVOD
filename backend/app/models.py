from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.contrib.auth.models import AbstractUser, PermissionsMixin
from django.db import models

class RoleTypes(models.TextChoices):
    ADMIN = 'admin'
    CLIENT = 'client'

class GenderTypes(models.TextChoices):
    MALE = 'male'
    FEMALE = 'female'
    OTHER = 'other'


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)


class Client(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255)
    second_name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=255,
        choices=RoleTypes.choices,
        default=RoleTypes.CLIENT,
    )
    gender = models.CharField(
        max_length=255,
        choices=GenderTypes.choices,
        default=GenderTypes.OTHER,
    )
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=255)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class Package(models.Model):
    name = models.CharField(max_length=255, unique=True)
    price = models.FloatField(max_length=255)
    movies = models.ManyToManyField('Movie', related_name='packages')

    def __str__(self):
        return self.name


class Subscription(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.client.email + ' ' + self.package.name


class Movie(models.Model):
    title = models.CharField(max_length=255, unique=True)
    description = models.CharField(max_length=255)
    release_year = models.PositiveSmallIntegerField()
    rating = models.DecimalField(max_digits=3, decimal_places=1)

    def __str__(self):
        return self.title

