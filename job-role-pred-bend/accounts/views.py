from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Users, Education, Certification, PredictionHistory, AdminLogs
from .serializers import (
    UserSerializer, EducationSerializer, CertificationSerializer,
    PredictionHistorySerializer, AdminLogsSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# -----------------------------
# Registration Endpoint
# -----------------------------
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    data = request.data
    email = data.get('email')
    name = data.get('name')
    password = data.get('password')
    role = data.get('role', 'USER')

    if not email or not name or not password:
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

    if Users.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = Users.objects.create_user(email=email, name=name, password=password, role=role)

    refresh = RefreshToken.for_user(user)
    serializer = UserSerializer(user)

    return Response({
        'user': serializer.data,
        'access': str(refresh.access_token),
        'refresh': str(refresh)
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
