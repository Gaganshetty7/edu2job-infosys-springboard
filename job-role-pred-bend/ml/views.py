from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from .models import Prediction 
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Count

import os
import json
from accounts.models import Education, Skill

from .train import train_model
from .predict import predict_job_role


# --- TRAIN (ADMIN ONLY + CSV upload) ---
@api_view(["POST"])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def train_view(request):
    dataset = request.FILES.get("dataset")

    if not dataset:
        return Response({"error": "No dataset uploaded"}, status=400)

    # Delete old model if exists
    if os.path.exists(settings.ML_MODEL_PATH):
        os.remove(settings.ML_MODEL_PATH)

    if os.path.exists(settings.ML_METADATA_PATH):
        os.remove(settings.ML_METADATA_PATH)

    msg = train_model(dataset)
    return Response({"message": msg})


# --- PREDICT (PUBLIC) ---
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def predict_view(request):
    skills = request.data.get("skills")
    qualification = request.data.get("qualification")
    experience = request.data.get("experience_level")

    if not (skills and qualification and experience):
        return Response({"error": "Missing fields"}, status=400)

    job = predict_job_role(skills, qualification, experience)

    # Extract the first prediction result
    raw_prediction = job[0]
    
    # Get the predicted role from the result
    if isinstance(raw_prediction, dict) and 'role' in raw_prediction:
        clean_role = raw_prediction['role']
    else:
        clean_role = str(raw_prediction)
     
    # Get confidence score
    confidence = float(job[0]['confidence'])

    # Use the qualification parameter sent from frontend (not user's saved profile)
    degree = qualification.strip()[:100]
    
    clean_role = clean_role.strip()[:255]

    prediction = Prediction.objects.create(
        predicted_roles=clean_role,
        education_qualification=degree,
        confidence_scores=confidence,
        timestamp=timezone.now(),
        user_id=request.user.id
    )

    
    return Response({
        "prediction_id": prediction.id,
        "predicted_role": job
        })


# -----------------------------
# Metadata View (Public)
@api_view(["GET"])
@permission_classes([AllowAny])
def metadata_view(request):
    metadata_path = os.path.join(os.path.dirname(settings.ML_MODEL_PATH), "metadata.json")

    if not os.path.exists(metadata_path):
        return Response({"error": "Metadata not found"}, status=404)

    with open(metadata_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return Response(data)

# -----------------------------
# Dashboard prediction Data View (Authenticated)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dash_prediction_data(request):
    # Degree
    edu = Education.objects.filter(user=request.user).first()
    degree = edu.degree if edu else None

    # Skills
    skills = Skill.objects.filter(user=request.user)
    skill_list = [s.skill_name for s in skills]

    # Hard-coded
    experience = "entry"

    return Response({
        "degree": degree,
        "skills": skill_list,
        "experience_level": experience
    })

# -----------------------------
# Admin stats
User = get_user_model()
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    return Response({
        'total_users': User.objects.count(),
        'predictions': Prediction.objects.count(),
        'approved_roles': Prediction.objects.filter(is_approved=True).count(),
        'flagged_predictions': Prediction.objects.filter(is_flagged=True).count(),
        'model_accuracy': 0.87
    })

# -----------------------------
# Fetch Recent Predictions
@api_view(['GET'])
@permission_classes([IsAdminUser])
def recent_activity(request):
    # Get pagination parameters
    offset = int(request.query_params.get('offset', 0))
    limit = int(request.query_params.get('limit', 10))
    
    recent = Prediction.objects.order_by('-timestamp')[offset:offset+limit]
    
    result = []
    for p in recent:
        role = p.predicted_roles
        
        # Extract role from JSON string
        if role.startswith('{'):
            try:
                import re
                match = re.search(r"'role':\s*'([^']+)'", role)
                role = match.group(1) if match else role[:30]
            except:
                role = role[:30]
        
        result.append({
            'id': p.id,
            'user_id': p.user_id,
            'predicted_role': role,  # Clean name only
            'confidence': float(p.confidence_scores),
            'timestamp': p.timestamp.strftime('%b %d, %H:%M'),
            'status': 'Approved' if (p.is_approved) else 
                     'Flagged' if (p.is_flagged) else 'Pending',
        })
    
    return Response(result)

# -----------------------------
# Update prediction feedback
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def prediction_feedback(request, pk):
    action = request.data.get("action")

    if action not in ["approve", "flag"]:
        return Response({"error": "Invalid action"}, status=400)

    try:
        prediction = Prediction.objects.get(id=pk, user_id=request.user.id)
    except Prediction.DoesNotExist:
        return Response({"error": "Prediction not found"}, status=404)

    # Prevent double feedback
    if prediction.is_approved or prediction.is_flagged:
        return Response({"error": "Feedback already submitted"}, status=400)

    if action == "approve":
        prediction.is_approved = True
        prediction.approved_at = timezone.now()

    if action == "flag":
        prediction.is_flagged = True

    prediction.save()

    return Response({"status": "success"})


# -----------------------------
# Education vs Job Role Trends (Public)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def education_job_trends(request):
    """
    Returns counts of predictions grouped by education_qualification and predicted_roles
    """
    # Aggregate predictions
    data = (
        Prediction.objects
        .values('education_qualification', 'predicted_roles')
        .annotate(count=Count('id'))
        .order_by('education_qualification', 'predicted_roles')
    )

    return Response(list(data))