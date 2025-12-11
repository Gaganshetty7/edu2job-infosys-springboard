from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Users, Education, Certification, PredictionHistory, AdminLogs
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # You can add custom claims here if needed
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra responses here
        data.update({
            "user_id": self.user.id,
            "email": self.user.email,
            "name": self.user.name,
            "role": self.user.role
        })
        return data

class EmailAuthTokenSerializer(serializers.Serializer):
    email = serializers.EmailField(label="Email")
    password = serializers.CharField(label="Password", style={'input_type': 'password'}, trim_whitespace=False)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Use authenticate with email
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError('Unable to log in with provided credentials.', code='authorization')
        else:
            raise serializers.ValidationError('Must include "email" and "password".', code='authorization')

        attrs['user'] = user
        return attrs
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['id', 'email', 'name', 'role', 'is_active', 'is_staff']

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'user', 'degree', 'specialization', 'university', 'cgpa', 'year_of_completion']

class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id', 'user', 'cert_name', 'issuing_organization', 'issue_date']

class PredictionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionHistory
        fields = ['id', 'user', 'predicted_roles', 'confidence_scores', 'timestamp']

class AdminLogsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminLogs
        fields = ['id', 'admin', 'target_user', 'action_type', 'timestamp']
