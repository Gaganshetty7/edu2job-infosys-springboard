from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Users, Education, Certification, PredictionHistory, AdminLogs, PlacementStatus, Skill, Project
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# -------------------------------
# JWT Token Serializer (Custom)
# -------------------------------
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # You can add custom claims here if needed
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Include additional user info in the login response
        data.update({
            "user_id": self.user.id,
            "email": self.user.email,
            "name": self.user.name,
            "role": self.user.role
        })
        return data


# -------------------------------
# Email/Password Login Serializer
# -------------------------------
class EmailAuthTokenSerializer(serializers.Serializer):
    email = serializers.EmailField(label="Email")
    password = serializers.CharField(label="Password", style={'input_type': 'password'}, trim_whitespace=False)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Authenticate user using email
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError('Unable to log in with provided credentials.', code='authorization')
        else:
            raise serializers.ValidationError('Must include "email" and "password".', code='authorization')

        attrs['user'] = user
        return attrs


# -------------------------------
# Base Serializers for Models
# -------------------------------
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

class PlacementStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlacementStatus
        fields = ['company', 'job_title', 'joining_date']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['skill_name']

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['title', 'description']


# -------------------------------
# Nested Serializers for Profile
# -------------------------------
class EducationNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id','degree', 'specialization', 'university', 'cgpa', 'year_of_completion']

class CertificationNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id','cert_name', 'issuing_organization', 'issue_date']

class PredictionHistoryNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionHistory
        fields = ['id','predicted_roles', 'confidence_scores', 'timestamp']

class PlacementStatusNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlacementStatus
        fields = ['company', 'job_title', 'joining_date']

class SkillNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['skill_name']

class ProjectNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['title', 'description']


# -------------------------------
# Combined Profile Serializer
# -------------------------------
class UserProfileSerializer(serializers.ModelSerializer):
    # Include related models as nested fields
    educations = EducationNestedSerializer(many=True, read_only=True)
    certifications = CertificationNestedSerializer(many=True, read_only=True)
    prediction_histories = PredictionHistoryNestedSerializer(many=True, read_only=True)
    placement_status = PlacementStatusNestedSerializer(read_only=True)
    skills = SkillNestedSerializer(many=True, read_only=True)
    projects = ProjectNestedSerializer(many=True, read_only=True)

    class Meta:
        model = Users
        # Return user info + all nested data for profile page
        fields = [
            'id', 'email', 'name', 'role',
            'educations',
            'certifications',
            'prediction_histories',
            'placement_status',
            'skills',
            'projects'
        ]
