from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import UserRole


class IsBuyer(BasePermission):
    message = "This action is available to buyers only."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and user.role == UserRole.BUYER
        )


class IsSeller(BasePermission):
    message = "This action is available to sellers only."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and user.role == UserRole.SELLER
        )


class IsAdmin(BasePermission):
    message = "This action is available to administrators only."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and user.role == UserRole.ADMIN
        )


class IsAdminOrReadOnly(BasePermission):
    message = "This action is restricted to administrators."

    def has_permission(self, request, view):
        user = request.user
        if user and user.is_authenticated and user.role == UserRole.ADMIN:
            return True
        return request.method in SAFE_METHODS


class IsOwnerOrReadOnly(BasePermission):
    """Object-level permission: only the owner may modify the resource."""

    message = "You do not have permission to modify this resource."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.role == UserRole.ADMIN:
            return True
        owner = getattr(obj, "owner", None)
        return owner is not None and owner == user


class IsOwnerOrAdmin(BasePermission):
    """Object-level permission: only the owner or an admin may access."""

    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.role == UserRole.ADMIN:
            return True
        owner = getattr(obj, "owner", None)
        return owner is not None and owner == user
