from django.db import models

class Users(models.Model):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=100, unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=10)

    class Meta:
        db_table = 'users'


class Education(models.Model):
    education_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        Users,
        on_delete=models.CASCADE,
        db_column='user_id'
    )
    degree = models.CharField(max_length=50)
    specialization = models.CharField(max_length=100)
    university = models.CharField(max_length=100)
    cgpa = models.DecimalField(max_digits=3, decimal_places=2)
    year_of_completion = models.IntegerField()

    class Meta:
        db_table = 'education'


class Certification(models.Model):
    cert_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        Users,
        on_delete=models.CASCADE,
        db_column='user_id'
    )
    cert_name = models.CharField(max_length=100)
    issuing_organization = models.CharField(max_length=100)
    issue_date = models.DateField()

    class Meta:
        db_table = 'certification'


class PredictionHistory(models.Model):
    prediction_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        Users,
        on_delete=models.CASCADE,
        db_column='user_id'
    )
    predicted_roles = models.CharField(max_length=255)
    confidence_scores = models.DecimalField(max_digits=5, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'prediction_history'


class AdminLogs(models.Model):
    log_id = models.AutoField(primary_key=True)
    admin = models.ForeignKey(
        Users,
        on_delete=models.CASCADE,
        related_name='admin_logs',
        db_column='admin_id'
    )
    target_user = models.ForeignKey(
        Users,
        on_delete=models.CASCADE,
        related_name='target_logs',
        db_column='target_user_id'
    )
    action_type = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admin_logs'
