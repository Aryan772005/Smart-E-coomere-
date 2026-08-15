from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    GoogleAuthView,
    OTPSendView,
    OTPVerifyView,
    LogoutView,
    MeView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("google/", GoogleAuthView.as_view(), name="auth-google"),
    path("otp/send/", OTPSendView.as_view(), name="auth-otp-send"),
    path("otp/verify/", OTPVerifyView.as_view(), name="auth-otp-verify"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]
