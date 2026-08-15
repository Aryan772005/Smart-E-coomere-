from rest_framework import generics, permissions, filters, status, parsers
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.core.files.storage import default_storage
from django.conf import settings
import uuid
import os

from .models import Category, Product, ProductImage, WishlistItem
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateSerializer,
    ProductImageSerializer,
)


class CategoryListView(generics.ListAPIView):
    """GET /api/v1/marketplace/categories/ — list all root categories."""

    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Category.objects.filter(parent__isnull=True).prefetch_related("children")


class ProductListView(generics.ListCreateAPIView):
    """
    GET /api/v1/marketplace/products/ — list products with search & filters.
    POST /api/v1/marketplace/products/ — create a new listing (sellers only).
    """

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "brand", "model"]
    ordering_fields = ["price", "created_at", "views", "wishlist_count"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProductCreateSerializer
        return ProductListSerializer

    def get_queryset(self):
        qs = Product.objects.filter(status="available", is_active=True).select_related(
            "category", "seller"
        ).prefetch_related("images")

        # Filter by category slug
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(Q(category__slug=category) | Q(category__parent__slug=category))

        # Filter by condition (comma-separated)
        condition = self.request.query_params.get("condition")
        if condition:
            conditions = [c.strip() for c in condition.split(",")]
            qs = qs.filter(condition__in=conditions)

        # Price range
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        # City
        city = self.request.query_params.get("city")
        if city:
            qs = qs.filter(city__icontains=city)

        # Sort
        sort = self.request.query_params.get("sort")
        sort_map = {
            "price-asc": "price",
            "price-desc": "-price",
            "popular": "-views",
            "newest": "-created_at",
        }
        if sort in sort_map:
            qs = qs.order_by(sort_map[sort])

        return qs

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/v1/marketplace/products/{slug}/ — product detail.
    PATCH /api/v1/marketplace/products/{slug}/ — edit (owner only).
    DELETE /api/v1/marketplace/products/{slug}/ — delete (owner only).
    """

    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related(
            "category", "seller"
        ).prefetch_related("images")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        Product.all_objects.filter(pk=instance.pk).update(views=instance.views + 1)
        instance.views += 1
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class MyListingsView(generics.ListAPIView):
    """GET /api/v1/marketplace/my-listings/ — current seller's products."""

    serializer_class = ProductListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.all_objects.filter(seller=self.request.user).select_related(
            "category"
        ).prefetch_related("images")


class ProductImageUploadView(APIView):
    """
    POST /api/v1/marketplace/products/{slug}/images/ — upload product images.
    Accepts multipart/form-data with one or more 'images' files.
    Returns the created ProductImage records.
    """

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request, slug):
        try:
            product = Product.all_objects.get(slug=slug, seller=request.user)
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found or you don't have permission."},
                status=status.HTTP_404_NOT_FOUND,
            )

        files = request.FILES.getlist("images")
        if not files:
            return Response(
                {"detail": "No image files provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(files) > 10:
            return Response(
                {"detail": "Maximum 10 images allowed per upload."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_count = product.images.count()
        created_images = []

        for i, file in enumerate(files):
            # Validate file type
            content_type = file.content_type or ""
            if not content_type.startswith("image/"):
                continue

            # Validate file size (max 5MB)
            if file.size > 5 * 1024 * 1024:
                continue

            # Generate unique filename
            ext = os.path.splitext(file.name)[1] or ".jpg"
            filename = f"products/{product.slug}/{uuid.uuid4().hex[:12]}{ext}"

            # Save file
            saved_path = default_storage.save(filename, file)

            # Build URL
            if hasattr(default_storage, "url"):
                try:
                    file_url = default_storage.url(saved_path)
                except Exception:
                    file_url = f"{settings.MEDIA_URL}{saved_path}"
            else:
                file_url = f"{settings.MEDIA_URL}{saved_path}"

            # Make absolute URL if it's a relative path
            if file_url.startswith("/"):
                scheme = "https" if request.is_secure() else "http"
                file_url = f"{scheme}://{request.get_host()}{file_url}"

            # Create ProductImage record
            position = existing_count + i
            is_primary = existing_count == 0 and i == 0
            img = ProductImage.objects.create(
                product=product,
                url=file_url,
                alt=f"{product.title} - Image {position + 1}",
                position=position,
                is_primary=is_primary,
            )
            created_images.append(img)

        serializer = ProductImageSerializer(created_images, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WishlistView(APIView):
    """
    GET /api/v1/marketplace/wishlist/ — list wishlisted products.
    POST /api/v1/marketplace/wishlist/ — toggle wishlist for a product.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = WishlistItem.objects.filter(user=request.user).select_related(
            "product__category", "product__seller"
        ).prefetch_related("product__images")
        products = [item.product for item in items]
        serializer = ProductListSerializer(products, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        product_id = request.data.get("product_id")
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        item, created = WishlistItem.objects.get_or_create(user=request.user, product=product)
        if not created:
            item.delete()
            Product.all_objects.filter(pk=product.pk).update(
                wishlist_count=max(0, product.wishlist_count - 1)
            )
            return Response({"wishlisted": False})
        Product.all_objects.filter(pk=product.pk).update(
            wishlist_count=product.wishlist_count + 1
        )
        return Response({"wishlisted": True}, status=status.HTTP_201_CREATED)
