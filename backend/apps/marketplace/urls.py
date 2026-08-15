from django.urls import path
from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    MyListingsView,
    WishlistView,
    ProductImageUploadView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="product-detail"),
    path("products/<slug:slug>/images/", ProductImageUploadView.as_view(), name="product-image-upload"),
    path("my-listings/", MyListingsView.as_view(), name="my-listings"),
    path("wishlist/", WishlistView.as_view(), name="wishlist"),
]
