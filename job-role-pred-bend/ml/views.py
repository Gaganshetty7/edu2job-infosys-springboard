from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

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

    msg = train_model(dataset)
    return Response({"message": msg})


# --- PREDICT (PUBLIC) ---
@api_view(["POST"])
@permission_classes([AllowAny])
def predict_view(request):
    skills = request.data.get("skills")
    qualification = request.data.get("qualification")
    experience = request.data.get("experience_level")

    if not (skills and qualification and experience):
        return Response({"error": "Missing fields"}, status=400)

    job = predict_job_role(skills, qualification, experience)
    return Response({"predicted_role": job})
