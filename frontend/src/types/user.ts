export type UserRole = "buyer" | "seller" | "admin";

export type UserStatus = "active" | "banned";

export interface User {
  id: number;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  bio: string | null;
  rating: number;
  reviewCount: number;
  completedOrders: number;
  createdAt: string;
}

export interface PublicUser {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string | null;
  rating: number;
  reviewCount: number;
  verified: boolean;
  memberSince: string;
}

export interface Address {
  id: number;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  latitude: number | null;
  longitude: number | null;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: User;
}
