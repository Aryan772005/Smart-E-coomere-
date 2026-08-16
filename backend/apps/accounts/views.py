from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    GoogleAuthSerializer,
    OTPSendSerializer,
    OTPVerifySerializer,
    UserSerializer,
)

User = get_user_model()

# In-memory OTP storage for dev simulation
TEMP_OTP_STORE = {}


class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/ — create a new user account."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/v1/auth/login/ — authenticate and return JWT tokens."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }
        )


class GoogleAuthView(APIView):
    """POST /api/v1/auth/google/ — authenticate or register user via Google profile."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            serializer = GoogleAuthSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                }
            )
        except Exception as e:
            if isinstance(e, serializers.ValidationError):
                raise e
            import traceback
            error_trace = traceback.format_exc()
            return Response({"detail": f"Backend Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class OTPSendView(APIView):
    """POST /api/v1/auth/otp/send/ — send 6-digit OTP code to phone number."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]

        # Store fixed 6-digit code for testing or generate 584920
        code = "584920"
        TEMP_OTP_STORE[phone] = code

        return Response(
            {
                "detail": f"OTP sent successfully to {phone}.",
                "phone": phone,
                "code": code,  # returned for instant dev testing
            },
            status=status.HTTP_200_OK,
        )


class OTPVerifyView(APIView):
    """POST /api/v1/auth/otp/verify/ — verify 6-digit OTP code and return JWT tokens."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]
        otp = serializer.validated_data["otp"]

        expected_otp = TEMP_OTP_STORE.get(phone, "584920")

        if otp != expected_otp and otp != "584920":
            return Response(
                {"detail": "Invalid or expired OTP code. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get or create user by phone number
        email = f"user_{phone[-6:]}@reloqa.phone"
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={
                "email": email,
                "first_name": f"User {phone[-4:]}",
                "is_phone_verified": True,
                "role": "buyer",
            },
        )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }
        )


class LogoutView(APIView):
    """POST /api/v1/auth/logout/ — blacklist the refresh token."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except (TokenError, InvalidToken):
            pass
        return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/auth/me/ — retrieve or update current user."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
