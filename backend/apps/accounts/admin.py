from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["-created_at"]
    list_display = ["email", "full_name", "role", "status", "is_staff", "created_at"]
    list_filter = ["role", "status", "is_staff", "is_superuser", "is_email_verified"]
    search_fields = ["email", "first_name", "last_name", "phone"]
    readonly_fields = ["created_at", "updated_at", "last_login", "last_seen_at"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Profile",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "phone",
                    "avatar",
                    "bio",
                    "role",
                    "status",
                )
            },
        ),
        (
            "Verification",
            {
                "fields": (
                    "is_email_verified",
                    "is_phone_verified",
                    "google_sub",
                )
            },
        ),
        (
            "Ratings",
            {"fields": ("rating", "review_count", "completed_orders")},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "last_login",
                    "last_seen_at",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "role",
                    "password1",
                    "password2",
                ),
            },
        ),
    )
