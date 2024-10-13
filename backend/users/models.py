from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator


class MyUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        """ Create and return a regular User """
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """ Create and return a Superuser """
        extra_fields.setdefault('is_admin', True)
        extra_fields.setdefault('is_staff', True)

        if extra_fields.get('is_admin') is not True:
            raise ValueError('Superuser must have is_admin=True.')
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')

        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField(
        unique=True,
        verbose_name="Email",
        help_text="Email",
        null=False,
        blank=False
    )
    username = models.CharField(
        max_length=254,
        verbose_name='User',
        help_text=(
            'Required. 254 characters or fewer. Letters, digits and @/./+/-/_ only.'
        ),
        unique=True,
        null=False,
        blank=False,
        validators=[
            RegexValidator(
                regex=r'^(?!^me$)[\w.@+-]+$',
                message='Username must be Alphanumeric',
                code='invalid_username',
            )
        ],
    )
    telegram_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Telegram ID",
        help_text="Telegram ID",
    )
    is_active = models.BooleanField(default=True, verbose_name="Active")
    is_admin = models.BooleanField(default=False, verbose_name="Admin")
    is_staff = models.BooleanField(default=False, verbose_name="Staff")

    objects = MyUserManager()

    REQUIRED_FIELDS = ['email']
    USERNAME_FIELD = 'username'

    class Meta:
        verbose_name = 'User'

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        """Does the user have a specific permission?"""
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        """Does the user have permissions to view the app `app_label`?"""
        # Simplest possible answer: Yes, always
        return True
