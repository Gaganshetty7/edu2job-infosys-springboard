from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# -------------------------------
# User Manager
# -------------------------------
class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, password=None, role='USER', **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, name, password, role='ADMIN', **extra_fields)


# -------------------------------
# User Model
# -------------------------------
class Users(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('USER', 'User'),
        ('ADMIN', 'Admin'),
    )

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

    class Meta:
        db_table = 'users'


# -------------------------------
# Education
# -------------------------------
class Education(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='educations'
    )
    degree = models.CharField(max_length=50)
    specialization = models.CharField(max_length=100)
    university = models.CharField(max_length=100)
    cgpa = models.DecimalField(max_digits=3, decimal_places=2)
    year_of_completion = models.IntegerField()

    class Meta:
        db_table = 'education'


# -------------------------------
# Certification
# -------------------------------
class Certification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='certifications'
    )
    cert_name = models.CharField(max_length=100)
    issuing_organization = models.CharField(max_length=100)
    issue_date = models.DateField()

    class Meta:
        db_table = 'certification'


# -------------------------------
# Prediction History
# -------------------------------
class PredictionHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='prediction_histories'
    )
    predicted_roles = models.CharField(max_length=255)
    confidence_scores = models.DecimalField(max_digits=5, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'prediction_history'


# -------------------------------
# Admin Logs
# -------------------------------
class AdminLogs(models.Model):
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='admin_logs'
    )
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='target_logs'
    )
    action_type = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admin_logs'


# -------------------------------
# Placement Status
# -------------------------------
class PlacementStatus(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='placement_status'
    )
    company = models.CharField(max_length=255)
    job_title = models.CharField(max_length=255)
    joining_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'placement_status'


# -------------------------------
# Skills
# -------------------------------
class Skill(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='skills'
    )
    skill_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'skills'


# -------------------------------
# Projects
# -------------------------------
class Project(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()

    class Meta:
        db_table = 'projects'

# -------------------------------
# Dashboard Data
# -------------------------------
class DashboardSnapshot(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='dashboard_snapshot'
    )

    profile_complete = models.BooleanField(default=False)

    predictions = models.JSONField()

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dashboard_snapshot'