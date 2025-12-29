from django.urls import path
from .views import train_view, predict_view

urlpatterns = [
    path("train/", train_view),
    path("predict/", predict_view),
]
