class TimestampedSerializerMixin:
    """Mixin exposing ISO-8601 timestamps shared by every resource."""

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(instance, "created_at"):
            data["created_at"] = instance.created_at.isoformat()
        if hasattr(instance, "updated_at"):
            data["updated_at"] = instance.updated_at.isoformat()
        return data
