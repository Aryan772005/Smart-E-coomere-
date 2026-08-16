from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from apps.core.models.base import TimeStampedModel


class UserRole(models.TextChoices):
    BUYER = "buyer", "Buyer"
    SELLER = "seller", "Seller"
    ADMIN = "admin", "Admin"


class UserStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    BANNED = "banned", "Banned"


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", UserRole.BUYER)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_seller(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", UserRole.SELLER)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("role", UserRole.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_email_verified", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, null=True, db_index=True)
    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64, blank=True, default="")
    avatar = models.URLField(max_length=1024, blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, default="")

    role = models.CharField(max_length=10, choices=UserRole.choices, default=UserRole.BUYER, db_index=True)
    status = models.CharField(max_length=10, choices=UserStatus.choices, default=UserStatus.ACTIVE, db_index=True)

    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)

    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0, validators=[MinValueValidator(0)])
    review_count = models.PositiveIntegerField(default=0)
    completed_orders = models.PositiveIntegerField(default=0)

    google_sub = models.CharField(max_length=128, blank=True, null=True, unique=True, db_index=True)
    last_seen_at = models.DateTimeField(default=timezone.now)

    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name"]

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["role", "status"]),
            models.Index(fields=["rating"]),
        ]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def initials(self):
        parts = [self.first_name, self.last_name]
        letters = "".join(part[0] for part in parts if part)
        return (letters or self.email[0]).upper()[:2]

    @property
    def is_seller(self):
        return self.role == UserRole.SELLER

    @property
    def is_buyer(self):
        return self.role == UserRole.BUYER

    @property
    def is_admin_user(self):
        return self.role == UserRole.ADMIN

    @property
    def is_banned(self):
        return self.status == UserStatus.BANNED

    def ban(self):
        self.status = UserStatus.BANNED
        self.save(update_fields=["status", "updated_at"])

    def unban(self):
        self.status = UserStatus.ACTIVE
        self.save(update_fields=["status", "updated_at"])

    def promote_to_seller(self):
        self.role = UserRole.SELLER
        self.save(update_fields=["role", "updated_at"])

    def touch_last_seen(self):
        User.objects.filter(pk=self.pk).update(last_seen_at=timezone.now())
