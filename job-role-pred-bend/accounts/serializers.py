from rest_framework import serializers
from .models import Users, Education, PredictionHistory, Certification, AdminLogs

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionHistory
        fields = '__all__'
