from django.urls import path
from .views import train_view, predict_view, metadata_view, dash_prediction_data, admin_stats, recent_activity, prediction_feedback,train_model

urlpatterns = [
    path("admin/train/", train_view),
    path("predict/", predict_view),
    path("metadata/", metadata_view, name="metadata"),
    path("dash-prediction-data/", dash_prediction_data, name="dash-prediction-data"),
    path('admin/stats/', admin_stats),
    path('admin/recent/', recent_activity),
    path("prediction/<int:pk>/feedback/", prediction_feedback),

]
