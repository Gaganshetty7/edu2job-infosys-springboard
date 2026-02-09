# accounts/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.generics import ListAPIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Q
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer
from django.db import transaction
from django.conf import settings


from .models import Users, Education, Certification, AdminLogs, PlacementStatus, Skill, Project, DashboardSnapshot, Testimonial
from .serializers import (
    UserSerializer,
    EducationSerializer,
    CertificationSerializer,
    AdminLogsSerializer,
    MyTokenObtainPairSerializer,
    PlacementStatusSerializer,
    SkillSerializer,
    ProjectSerializer,
    TestimonialSerializer
)
import os

# -----------------------------
# Simple JWT Login View
# -----------------------------
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# Get the User model
User = get_user_model()

# Get Google client ID
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID

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
    

class AdminLogsViewSet(viewsets.ModelViewSet):
    queryset = AdminLogs.objects.all()
    serializer_class = AdminLogsSerializer
    permission_classes = [permissions.IsAdminUser]
    
class PlacementStatusViewSet(viewsets.ModelViewSet):
    queryset = PlacementStatus.objects.all()
    serializer_class = PlacementStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]


# -------------------------------
# Get Logged-in User Profile
# -------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_profile(request):
    """ Returns the profile of the currently logged-in user. """
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)


# -------------------------------
# Update Logged-in User Profile
# -------------------------------

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    data = request.data

    try:
        with transaction.atomic():
            
            # update basic user info
            user.name = data.get("name", user.name)
            user.email = data.get("email", user.email)
            user.save()

            # update education
            educations_data = data.get("educations", [])
            # Remove all existing entries
            Education.objects.filter(user=user).delete()
            # Add new entries
            for edu in educations_data:
                Education.objects.create(
                    user=user,
                    degree=edu.get("degree", ""),
                    specialization=edu.get("specialization", ""),
                    university=edu.get("university", ""),
                    cgpa=edu.get("cgpa") or 0.0,
                    year_of_completion=edu.get("year_of_completion") or 0
                )

            # update certifications
            certifications_data = data.get("certifications", [])
            Certification.objects.filter(user=user).delete()
            for cert in certifications_data:
                Certification.objects.create(
                    user=user,
                    cert_name=cert.get("cert_name", ""),
                    issuing_organization=cert.get("issuing_organization", ""),
                    issue_date=cert.get("issue_date")
                )

            # update placement status
            placement_data = data.get("placement_status")
            if placement_data:
                placement_obj, created = PlacementStatus.objects.get_or_create(user=user)
                placement_obj.company = placement_data.get("company", placement_obj.company)
                placement_obj.job_title = placement_data.get("job_title", placement_obj.job_title)
                placement_obj.joining_date = placement_data.get("joining_date", placement_obj.joining_date)
                placement_obj.save()

            #update skills
            skills_data = data.get("skills", [])
            Skill.objects.filter(user=user).delete()
            for skill in skills_data:
                Skill.objects.create(user=user, skill_name=skill.get("skill_name", ""))

            #update projects
            projects_data = data.get("projects", [])
            Project.objects.filter(user=user).delete()
            for proj in projects_data:
                Project.objects.create(
                    user=user,
                    title=proj.get("title", ""),
                    description=proj.get("description", "")
                )


        return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------
# Get Dashboard Snapshot
# -------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_dashboard_snapshot(request):
    try:
        snapshot = request.user.dashboard_snapshot
        return Response({
            "profile_complete": snapshot.profile_complete,
            "predictions": snapshot.predictions,
            "updated_at": snapshot.updated_at
        })
    except DashboardSnapshot.DoesNotExist:
        return Response(
            {"profile_complete": False},
            status=status.HTTP_404_NOT_FOUND
        )


# -------------------------------
# Upsert Dashboard Snapshot
# -------------------------------

@api_view(["POST", "PUT"])
@permission_classes([IsAuthenticated])
def upsert_dashboard_snapshot(request):
    user = request.user
    data = request.data

    # required fields
    if "predictions" not in data:
        return Response(
            {"error": "predictions is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    snapshot, created = DashboardSnapshot.objects.update_or_create(
        user=user,
        defaults={
            "profile_complete": data.get("profile_complete", True),
            "predictions": data["predictions"],
        }
    )

    return Response(
        {
            "message": "Dashboard snapshot saved",
            "created": created
        },
        status=status.HTTP_200_OK
    )

# -------------------------------
# Get Approved Testimonials
# -------------------------------
@api_view(["GET"])
def get_testimonials(request):
    testimonials = Testimonial.objects.filter(is_approved=True).order_by("-created_at")

    serializer = TestimonialSerializer(testimonials, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)

# -------------------------------
# Submit Testimonial
# -------------------------------
@api_view(["POST"])
def submit_testimonial(request):
    serializer = TestimonialSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer.save()  # is_approved defaults to False

    return Response(
        {"message": "Testimonial submitted for review"},
        status=status.HTTP_201_CREATED
    )

# -------------------------------
# Approve / Reject Testimonial
# -------------------------------
@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def approve_testimonial(request, testimonial_id):
    try:
        testimonial = Testimonial.objects.get(id=testimonial_id)
    except Testimonial.DoesNotExist:
        return Response(
            {"error": "Testimonial not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    is_approved = request.data.get("is_approved")

    if is_approved is None:
        return Response(
            {"error": "is_approved field is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    testimonial.is_approved = bool(is_approved)
    testimonial.save(update_fields=["is_approved"])

    return Response(
        {
            "message": "Testimonial status updated",
            "is_approved": testimonial.is_approved
        },
        status=status.HTTP_200_OK
    )

# -----------------------------
# Fetch Pending Testimonials (Admin)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def fetch_pending_testimonials(request):
    offset = int(request.query_params.get("offset", 0))
    limit = int(request.query_params.get("limit", 10))

    search = request.query_params.get("search", "").strip()
    sort = request.query_params.get("sort", "created_at")
    order = request.query_params.get("order", "desc")

    queryset = Testimonial.objects.filter(is_approved=False)

    # search
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) |
            Q(testimonial_text__icontains=search)
        )

    # sorting
    if order == "desc":
        sort = f"-{sort}"

    queryset = queryset.order_by(sort)

    testimonials = queryset[offset : offset + limit]

    result = []
    for t in testimonials:
        result.append({
            "id": t.id,
            "name": t.name,
            "rating": t.rating,
            "testimonial_text": t.testimonial_text,
            "created_at": t.created_at.strftime("%b %d, %Y"),
        })

    return Response({
        "count": queryset.count(),
        "results": result
    })