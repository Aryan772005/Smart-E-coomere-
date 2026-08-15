export type ProductCondition = "new" | "like-new" | "excellent" | "good" | "fair";

export type ProductStatus = "available" | "reserved" | "sold" | "hidden";

export type ListingType = "fixed" | "negotiable";

import type { PublicUser } from "./user";

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  parentId: number | null;
  children: Category[];
  productCount: number;
}

export interface ProductImage {
  id: number;
  url: string;
  alt: string;
  position: number;
  isPrimary: boolean;
}

export interface ProductSeller {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string | null;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}

export interface Product {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  condition: ProductCondition;
  listingType: ListingType;
  category: Category;
  brand: string | null;
  model: string | null;
  year: number | null;
  images: ProductImage[];
  seller: ProductSeller;
  city: string | null;
  status: ProductStatus;
  views: number;
  wishlistCount: number;
  isWishlisted: boolean;
  isNegotiable: boolean;
  location: { lat: number | null; lng: number | null };
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition[];
  brand?: string[];
  city?: string[];
  sortBy?: "newest" | "price-asc" | "price-desc" | "popular" | "rating";
  page?: number;
  pageSize?: number;
}

export interface ProductReview {
  id: number;
  productId: number;
  author: PublicUser;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

export interface WishlistItem {
  id: number;
  product: Product;
  createdAt: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}
