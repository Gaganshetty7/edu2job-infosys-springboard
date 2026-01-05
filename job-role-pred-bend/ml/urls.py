from django.urls import path
from .views import train_view, predict_view, metadata_view, dash_prediction_data

urlpatterns = [
    path("train/", train_view),
    path("predict/", predict_view),
    path("metadata/", metadata_view, name="metadata"),
    path("dash-prediction-data/", dash_prediction_data, name="dash-prediction-data"),
]
