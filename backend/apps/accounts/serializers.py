from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=["buyer", "seller"], default="buyer")

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "password", "role"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop("password")
        role = validated_data.pop("role", "buyer")
        user = User(**validated_data)
        user.set_password(password)
        user.role = role
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email", "").lower()
        password = data.get("password", "")
        user = authenticate(request=self.context.get("request"), email=email, password=password)
        if not user:
            raise serializers.ValidationError(
                {"detail": "No account found with these credentials."}
            )
        if not user.is_active:
            raise serializers.ValidationError({"detail": "This account is disabled."})
        data["user"] = user
        return data


class GoogleAuthSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField()
    google_sub = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    avatar = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def create(self, validated_data):
        email = validated_data["email"].lower()
        full_name = validated_data.get("name", "").strip()
        parts = full_name.split(" ", 1)
        first_name = parts[0] or "User"
        last_name = parts[1] if len(parts) > 1 else ""

        google_sub = validated_data.get("google_sub") or None
        avatar = validated_data.get("avatar") or None

        # Check by email first to avoid constraint conflicts
        user = User.objects.filter(email__iexact=email).first()

        if not user:
            user = User.objects.create(
                email=email,
                first_name=first_name,
                last_name=last_name,
                avatar=avatar,
                google_sub=google_sub,
                is_email_verified=True,
                role="buyer",
            )
        else:
            # Update missing avatar or sub if available
            fields_to_update = []
            if avatar and not user.avatar:
                user.avatar = avatar
                fields_to_update.append("avatar")
            if google_sub and not user.google_sub:
                user.google_sub = google_sub
                fields_to_update.append("google_sub")
            if fields_to_update:
                user.save(update_fields=fields_to_update)

        return user


class OTPSendSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)

    def validate_phone(self, value):
        cleaned = value.replace(" ", "").replace("-", "")
        if len(cleaned) < 10:
            raise serializers.ValidationError("Please enter a valid 10-digit mobile number.")
        return cleaned


class OTPVerifySerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    otp = serializers.CharField(max_length=6, min_length=6)

    def validate_phone(self, value):
        return value.replace(" ", "").replace("-", "")


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    initials = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone",
            "first_name",
            "last_name",
            "full_name",
            "initials",
            "avatar",
            "bio",
            "role",
            "status",
            "is_email_verified",
            "is_phone_verified",
            "rating",
            "review_count",
            "completed_orders",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "email",
            "role",
            "status",
            "is_email_verified",
            "is_phone_verified",
            "rating",
            "review_count",
            "completed_orders",
            "created_at",
        ]
