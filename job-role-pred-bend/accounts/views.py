# accounts/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer

from .models import Users, Education, Certification, PredictionHistory, AdminLogs
from .serializers import (
    UserSerializer,
    EducationSerializer,
    CertificationSerializer,
    PredictionHistorySerializer,
    AdminLogsSerializer,
    MyTokenObtainPairSerializer,
)

# -----------------------------
# Simple JWT Login View
# -----------------------------
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# Get the User model
User = get_user_model()

# Your Google client ID from Google Cloud Console
GOOGLE_CLIENT_ID = "569496744656-q633fh30ns9c7qar292ul1brslib2qtj.apps.googleusercontent.com"

# -----------------------------
# Google Login
# -----------------------------
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def google_login(request):
    token = request.data.get("token")
    if not token:
        return Response({"error": "Token required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo.get("email")
        name = idinfo.get("name", "")

        # Create user if doesn't exist
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"name": name}
        )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": getattr(user, "role", "USER")
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })

    except ValueError:
        return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)

# -----------------------------
# Registration Endpoint
# -----------------------------
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_user(request):
    data = request.data
    email = data.get("email")
    name = data.get("name")
    password = data.get("password")
    role = data.get("role", "USER")

    if not email or not name or not password:
        return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    if Users.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

    user = Users.objects.create_user(email=email, name=name, password=password, role=role)
    refresh = RefreshToken.for_user(user)
    serializer = UserSerializer(user)

    return Response({
        "user": serializer.data,
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    }, status=status.HTTP_201_CREATED)

# -----------------------------
# ViewSets
# -----------------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = Users.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

class CertificationViewSet(viewsets.ModelViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]

class PredictionHistoryViewSet(viewsets.ModelViewSet):
    queryset = PredictionHistory.objects.all()
    serializer_class = PredictionHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

class AdminLogsViewSet(viewsets.ModelViewSet):
    queryset = AdminLogs.objects.all()
    serializer_class = AdminLogsSerializer
    permission_classes = [permissions.IsAdminUser]

# -------------------------------
# Get Logged-in User Profile
# -------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_profile(request):
    """
    Returns the profile of the currently logged-in user,
    including education, certifications, and prediction history.
    """
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)