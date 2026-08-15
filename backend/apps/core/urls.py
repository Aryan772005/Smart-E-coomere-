from django.urls import path

from .views import HealthView, RootView

urlpatterns = [
    path("", HealthView.as_view(), name="health"),
    path("root/", RootView.as_view(), name="root"),
]
