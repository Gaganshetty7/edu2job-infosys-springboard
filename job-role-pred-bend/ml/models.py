from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Prediction(models.Model):
    predicted_roles = models.CharField(max_length=255)
    confidence_scores = models.DecimalField(max_digits=5, decimal_places=2)
    timestamp = models.DateTimeField()
    user_id = models.BigIntegerField()
    is_approved = models.BooleanField(default=False)
    is_flagged = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'prediction_history'
        managed = False

