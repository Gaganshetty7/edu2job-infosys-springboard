from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, EducationViewSet, CertificationViewSet,
    PredictionHistoryViewSet, AdminLogsViewSet, MyTokenObtainPairView, register_user
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'educations', EducationViewSet)
router.register(r'certifications', CertificationViewSet)
router.register(r'prediction-history', PredictionHistoryViewSet)
router.register(r'admin-logs', AdminLogsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_user, name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
