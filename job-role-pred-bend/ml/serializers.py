# ml/serializers.py
from rest_framework import serializers
from .models import Prediction

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = [
            'id',
            'predicted_roles',
            'education_qualification',
            'confidence_scores',
            'timestamp',
            'user_id',
            'is_approved',
            'is_flagged'
        ]
