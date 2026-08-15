import uuid

from django.db import models


class TimeStampedModel(models.Model):
    """Abstract base with created/updated timestamps, ordered newest-first."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]


class SoftDeleteModel(models.Model):
    """Abstract base adding soft-delete support."""

    is_active = models.BooleanField(default=True, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True, editable=False)

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):  # noqa: ARG002
        from django.utils import timezone

        self.is_active = False
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_active", "deleted_at"])

    def restore(self):
        self.is_active = True
        self.deleted_at = None
        self.save(update_fields=["is_active", "deleted_at"])


class ActiveManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)


class AllManager(models.Manager):
    pass
