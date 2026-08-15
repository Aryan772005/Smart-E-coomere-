from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

admin.site.site_header = "Tariani Sellers — Administration & Database"
admin.site.site_title = "Tariani Sellers Portal"
admin.site.index_title = "Tariani Sellers — Direct Database Management"

urlpatterns = [
    path("", RedirectView.as_view(url="/api/docs/"), name="root-redirect"),
    path("django-admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/marketplace/", include("apps.marketplace.urls")),
    path("api/v1/orders/", include("apps.orders.urls")),
    path("api/v1/sellers/", include("apps.sellers.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/chat/", include("apps.chat.urls")),
    path("api/v1/admin/", include("apps.adminpanel.urls")),
    path("api/v1/health/", include("apps.core.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]

if settings.DEBUG:
    from django.conf.urls.static import static

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
