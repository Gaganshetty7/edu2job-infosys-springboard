from django.shortcuts import render
from rest_framework import viewsets
from .models import Users, PredictionHistory
from .serializers import UserSerializer, PredictionSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = Users.objects.all()
    serializer_class = UserSerializer

class PredictionViewSet(viewsets.ModelViewSet):
    queryset = PredictionHistory.objects.all()
    serializer_class = PredictionSerializer

