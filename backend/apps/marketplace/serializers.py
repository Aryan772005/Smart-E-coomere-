from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from .models import Category, Product, ProductImage, WishlistItem


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon", "image", "product_count", "children"]

    def get_children(self, obj):
        children = obj.children.all()
        return CategorySerializer(children, many=True).data


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "url", "alt", "position", "is_primary"]


class ProductSellerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    is_verified = serializers.BooleanField(source="is_email_verified", read_only=True)

    class Meta:
        from apps.accounts.models import User
        model = User
        fields = ["id", "full_name", "avatar", "rating", "review_count", "is_verified"]


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    seller = ProductSellerSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()
    is_negotiable = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "slug",
            "title",
            "price",
            "original_price",
            "condition",
            "listing_type",
            "is_negotiable",
            "category",
            "brand",
            "city",
            "status",
            "views",
            "wishlist_count",
            "is_wishlisted",
            "primary_image",
            "seller",
            "created_at",
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img:
            return {"url": img.url, "alt": img.alt}
        return None

    def get_is_wishlisted(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return WishlistItem.objects.filter(user=request.user, product=obj).exists()
        return False


class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + [
            "description",
            "model",
            "year",
            "images",
            "updated_at",
        ]


class ProductCreateSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField()

    class Meta:
        model = Product
        fields = [
            "title",
            "description",
            "price",
            "original_price",
            "condition",
            "listing_type",
            "category_id",
            "brand",
            "model",
            "year",
            "city",
        ]

    def validate_category_id(self, value):
        try:
            Category.objects.get(pk=value)
        except Category.DoesNotExist:
            raise serializers.ValidationError("Category not found.")
        return value

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["seller"] = request.user
        return super().create(validated_data)
