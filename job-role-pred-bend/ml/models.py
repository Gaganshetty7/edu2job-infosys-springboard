from django.db import models

class Prediction(models.Model):
    predicted_roles = models.CharField(max_length=255)
    education_qualification = models.CharField(max_length=100, null=True, blank=True)
    confidence_scores = models.DecimalField(max_digits=5, decimal_places=2)
    timestamp = models.DateTimeField()
    user_id = models.BigIntegerField()  # optional: can change to ForeignKey later
    is_approved = models.BooleanField(default=False)
    is_flagged = models.BooleanField(default=False)

    class Meta:
        db_table = 'prediction_history'
        managed = False  # keep False if table already exists
