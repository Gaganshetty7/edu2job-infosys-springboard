from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlacementStatusViewSet, ProjectViewSet, SkillViewSet, UserViewSet, EducationViewSet, CertificationViewSet,
    PredictionHistoryViewSet, AdminLogsViewSet, MyTokenObtainPairView,
    my_profile, register_user, update_profile,
    get_dashboard_snapshot, upsert_dashboard_snapshot
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import google_login

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'educations', EducationViewSet)
router.register(r'certifications', CertificationViewSet)
router.register(r'prediction-history', PredictionHistoryViewSet)
router.register(r'admin-logs', AdminLogsViewSet)
router.register(r'placement-status', PlacementStatusViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'projects', ProjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('google-login/', google_login, name='google-login'),
    path('register/', register_user, name='register_user'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("myprofile/", my_profile, name="my_profile"),
    path("updateprofile/", update_profile, name="update_profile"),
    path("dashboard-snapshot/", get_dashboard_snapshot, name="get-dashboard-snapshot"),
    path("dashboard-snapshot/save/", upsert_dashboard_snapshot, name="upsert-dashboard-snapshot"),
]
