from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.db.models import CheckConstraint, Q


# -------------------------------
# User Manager
# -------------------------------
class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, password=None, role='USER', **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)

        user = self.model(
            email=email,
            name=name,
            role=role,
            **extra_fields
        )
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

    created_at = models.DateTimeField(default=timezone.now)

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

    cgpa = models.DecimalField(max_digits=4, decimal_places=2)
    year_of_completion = models.PositiveIntegerField()

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
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'admin_logs'


# -------------------------------
# Prediction History
# -------------------------------
class Prediction(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='predictions'
    )
    predicted_roles = models.CharField(max_length=255)
    education_qualification = models.CharField(max_length=100, null=True, blank=True)
    confidence_scores = models.DecimalField(max_digits=5, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)
    is_flagged = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'prediction_history'


# -------------------------------
# Placement Status
# -------------------------------
class PlacementStatus(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='placement_status'
    )
    company = models.CharField(max_length=255, null=True, blank=True)
    job_title = models.CharField(max_length=255, null=True, blank=True)
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
    description = models.TextField(blank=True)

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
    predictions = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dashboard_snapshot'

# -------------------------------
# Testimonials Data
# -------------------------------
from django.core.validators import MinValueValidator, MaxValueValidator

class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=150)

    testimonial_text = models.TextField()

    rating = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5),
        ]
    )

    is_approved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "testimonials"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.rating}★)"