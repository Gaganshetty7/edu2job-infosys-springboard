from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, PredictionViewSet



router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'predictions', PredictionViewSet)



urlpatterns = [
    path('api/', include(router.urls)),
]
