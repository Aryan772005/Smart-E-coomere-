from django.db import connections
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = []

    def get(self, request):
        status_code = "ok"
        db_status = "ok"
        try:
            connections["default"].cursor().execute("SELECT 1")
        except Exception:  # pragma: no cover - depends on infra state
            db_status = "error"
            status_code = "degraded"

        return Response(
            {
                "status": status_code,
                "service": "reloqa-api",
                "version": "1.0.0",
                "database": db_status,
                "timestamp": timezone.now().isoformat(),
            },
            status=200 if status_code == "ok" else 503,
        )


class RootView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response(
            {
                "name": "Reloqa API",
                "version": "1.0.0",
                "docs": "/api/docs/",
                "schema": "/api/schema/",
            }
        )
