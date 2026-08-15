from django.db import models
from django.utils.text import slugify
import uuid

from apps.core.models.base import TimeStampedModel, SoftDeleteModel, ActiveManager, AllManager


class Category(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    icon = models.CharField(max_length=50, blank=True, null=True, help_text="Lucide icon name")
    image = models.URLField(blank=True, null=True)
    parent = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.SET_NULL, related_name="children"
    )
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def product_count(self):
        return self.products.filter(status="available", is_active=True).count()


class ProductCondition(models.TextChoices):
    NEW = "new", "New"
    LIKE_NEW = "like-new", "Like New"
    EXCELLENT = "excellent", "Excellent"
    GOOD = "good", "Good"
    FAIR = "fair", "Fair"


class ProductStatus(models.TextChoices):
    AVAILABLE = "available", "Available"
    RESERVED = "reserved", "Reserved"
    SOLD = "sold", "Sold"
    HIDDEN = "hidden", "Hidden"


class ListingType(models.TextChoices):
    FIXED = "fixed", "Fixed Price"
    NEGOTIABLE = "negotiable", "Negotiable"


class Product(TimeStampedModel, SoftDeleteModel):
    seller = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="products"
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name="products"
    )

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(max_length=5000)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    original_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    condition = models.CharField(max_length=20, choices=ProductCondition.choices)
    listing_type = models.CharField(
        max_length=20, choices=ListingType.choices, default=ListingType.FIXED
    )
    status = models.CharField(
        max_length=20, choices=ProductStatus.choices, default=ProductStatus.AVAILABLE, db_index=True
    )

    brand = models.CharField(max_length=100, blank=True, null=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    year = models.PositiveSmallIntegerField(null=True, blank=True)

    city = models.CharField(max_length=100, blank=True, null=True)
    views = models.PositiveIntegerField(default=0)
    wishlist_count = models.PositiveIntegerField(default=0)

    objects = ActiveManager()
    all_objects = AllManager()

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "is_active"]),
            models.Index(fields=["category", "status"]),
            models.Index(fields=["seller", "status"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            unique_slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
            self.slug = unique_slug
        super().save(*args, **kwargs)

    @property
    def is_negotiable(self):
        return self.listing_type == ListingType.NEGOTIABLE


class ProductImage(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    url = models.URLField()
    alt = models.CharField(max_length=200, blank=True)
    position = models.PositiveSmallIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return f"Image for {self.product.title}"


class WishlistItem(TimeStampedModel):
    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="wishlist"
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="wishlisted_by")

    class Meta:
        unique_together = [["user", "product"]]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} → {self.product.title}"
