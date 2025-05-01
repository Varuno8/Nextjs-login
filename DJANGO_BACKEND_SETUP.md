
# Eigengram Healthcare Platform - Django Backend Setup

This document provides instructions for setting up the Django backend for the Eigengram Healthcare Platform.

## Requirements

- Python 3.9+
- PostgreSQL database
- Django 4.2+

## Project Setup

1. Create a new Django project:

```bash
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt
django-admin startproject eigengram_backend
cd eigengram_backend
```

2. Create the core apps:

```bash
python manage.py startapp users
python manage.py startapp services
python manage.py startapp subscriptions
python manage.py startapp feature_requests
python manage.py startapp analytics
```

3. Update `settings.py` with the following configuration:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'corsheaders',
    
    # Local apps
    'users',
    'services',
    'subscriptions',
    'feature_requests',
    'analytics',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add at the top
    # Other middleware...
]

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# JWT settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # For development only
# For production, use:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "https://your-production-domain.com",
# ]

# Custom user model
AUTH_USER_MODEL = 'users.User'
```

## Models

### User Model

Create `users/models.py`:

```python
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'ADMIN')
        return self.create_user(email, username, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('USER', 'User'),
        ('ADMIN', 'Admin'),
    )
    
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    image = models.ImageField(upload_to='users/', null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
```

### Service Model

Create `services/models.py`:

```python
from django.db import models
import uuid

class Service(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='services/', null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50)
    features = models.JSONField(default=list)
    model_endpoint = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
```

### Subscription Model

Create `subscriptions/models.py`:

```python
from django.db import models
from django.conf import settings
import uuid

class Subscription(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('CANCELED', 'Canceled'),
        ('EXPIRED', 'Expired'),
        ('PENDING', 'Pending'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE, related_name='subscriptions')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    last_usage = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'service')
    
    def __str__(self):
        return f"{self.user.username} - {self.service.name}"
```

### Feature Request Model

Create `feature_requests/models.py`:

```python
from django.db import models
from django.conf import settings
import uuid

class FeatureRequest(models.Model):
    STATUS_CHOICES = (
        ('NEW', 'New'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('REJECTED', 'Rejected'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='feature_requests')
    title = models.CharField(max_length=100)
    description = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='NEW')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
```

## Serializers

### User Serializers

Create `users/serializers.py`:

```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'phone_number', 'image', 'role']
        read_only_fields = ['id', 'role']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'phone_number', 'password', 'confirm_password']
        
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            name=validated_data.get('name', ''),
            phone_number=validated_data.get('phone_number', '')
        )
        
        user.set_password(validated_data['password'])
        user.save()
        
        return user

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'phone_number', 'image', 'role', 'is_active', 'date_joined']
```

### Service Serializers

Create `services/serializers.py`:

```python
from rest_framework import serializers
from .models import Service

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'
```

### Subscription Serializers

Create `subscriptions/serializers.py`:

```python
from rest_framework import serializers
from .models import Subscription
from services.serializers import ServiceSerializer

class SubscriptionSerializer(serializers.ModelSerializer):
    service_details = ServiceSerializer(source='service', read_only=True)
    
    class Meta:
        model = Subscription
        fields = ['id', 'service', 'service_details', 'status', 'start_date', 'end_date', 'created_at']
        read_only_fields = ['id', 'start_date', 'created_at']

class SubscriptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['service']
        
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
```

### Feature Request Serializers

Create `feature_requests/serializers.py`:

```python
from rest_framework import serializers
from .models import FeatureRequest

class FeatureRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = FeatureRequest
        fields = ['id', 'title', 'description', 'status', 'created_at', 'user_name']
        read_only_fields = ['id', 'status', 'created_at', 'user_name']

class FeatureRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureRequest
        fields = ['title', 'description']
        
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class AdminFeatureRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = FeatureRequest
        fields = ['id', 'title', 'description', 'status', 'created_at', 'updated_at', 'user_name']
```

## Views and URLs

### User Views

Create `users/views.py`:

```python
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserCreateSerializer, AdminUserSerializer

User = get_user_model()

class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [AllowAny]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.request.user.role == 'ADMIN':
            return AdminUserSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
```

Create `users/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register('', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

### Service Views

Create `services/views.py`:

```python
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Service
from .serializers import ServiceSerializer
from .permissions import IsAdminOrReadOnly

class ServiceViewSet(ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]
```

Create `services/permissions.py`:

```python
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.role == 'ADMIN'
```

Create `services/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet

router = DefaultRouter()
router.register('', ServiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

### Subscription Views

Create `subscriptions/views.py`:

```python
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Subscription
from .serializers import SubscriptionSerializer, SubscriptionCreateSerializer
from django.utils import timezone

class SubscriptionViewSet(ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return Subscription.objects.all()
        return Subscription.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SubscriptionCreateSerializer
        return SubscriptionSerializer
    
    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        subscription = self.get_object()
        
        if subscription.user != request.user and request.user.role != 'ADMIN':
            return Response({"detail": "You don't have permission to cancel this subscription"}, status=403)
            
        subscription.status = 'CANCELED'
        subscription.end_date = timezone.now()
        subscription.save()
        
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)
```

Create `subscriptions/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubscriptionViewSet

router = DefaultRouter()
router.register('', SubscriptionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

### Feature Request Views

Create `feature_requests/views.py`:

```python
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import FeatureRequest
from .serializers import FeatureRequestSerializer, FeatureRequestCreateSerializer, AdminFeatureRequestSerializer
from rest_framework.response import Response

class FeatureRequestViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return FeatureRequest.objects.all()
        return FeatureRequest.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.user.role == 'ADMIN':
            return AdminFeatureRequestSerializer
        if self.action == 'create':
            return FeatureRequestCreateSerializer
        return FeatureRequestSerializer
```

Create `feature_requests/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeatureRequestViewSet

router = DefaultRouter()
router.register('', FeatureRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

### Analytics Views

Create `analytics/views.py`:

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from subscriptions.models import Subscription
from services.models import Service
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    user_count = User.objects.filter(role='USER').count()
    active_subscriptions = Subscription.objects.filter(status='ACTIVE').count()
    service_count = Service.objects.count()
    
    recent_users = User.objects.filter(role='USER').order_by('-date_joined')[:5]
    recent_users_data = [
        {'id': str(user.id), 'username': user.username, 'email': user.email, 'date_joined': user.date_joined}
        for user in recent_users
    ]
    
    return Response({
        'user_count': user_count,
        'active_subscriptions': active_subscriptions,
        'service_count': service_count,
        'recent_users': recent_users_data
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_growth(request):
    period = request.query_params.get('period', 'month')
    
    if period == 'week':
        days = 7
        format_str = '%Y-%m-%d'
    elif period == 'month':
        days = 30
        format_str = '%Y-%m-%d'
    elif period == 'year':
        days = 365
        format_str = '%Y-%m'
    else:
        days = 30
        format_str = '%Y-%m-%d'
    
    start_date = timezone.now() - timedelta(days=days)
    
    users = User.objects.filter(
        date_joined__gte=start_date,
        role='USER'
    ).extra(
        select={'period': f"to_char(date_joined, '{format_str}')"}
    ).values('period').annotate(count=Count('id')).order_by('period')
    
    return Response(list(users))

@api_view(['GET'])
@permission_classes([IsAdminUser])
def subscription_analytics(request):
    # Get counts by service
    service_stats = Subscription.objects.values(
        'service__name', 'status'
    ).annotate(count=Count('id'))
    
    # Organize by service
    services = {}
    for stat in service_stats:
        service_name = stat['service__name']
        if service_name not in services:
            services[service_name] = {'total': 0}
        
        status = stat['status'].lower()
        services[service_name][status] = stat['count']
        services[service_name]['total'] += stat['count']
    
    # Format for the frontend
    result = [
        {
            'name': name,
            'total': data['total'],
            'active': data.get('active', 0),
            'canceled': data.get('canceled', 0),
            'pending': data.get('pending', 0),
            'expired': data.get('expired', 0),
        }
        for name, data in services.items()
    ]
    
    return Response(result)
```

Create `analytics/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_stats),
    path('users/', views.user_growth),
    path('subscriptions/', views.subscription_analytics),
]
```

### JWT Authentication

Update `eigengram_backend/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # JWT authentication endpoints
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # API endpoints
    path('api/users/', include('users.urls')),
    path('api/services/', include('services.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/feature-requests/', include('feature_requests.urls')),
    path('api/analytics/', include('analytics.urls')),
    
    # Admin API endpoints
    path('api/admin/users/', include('users.urls')),
    path('api/admin/subscriptions/', include('subscriptions.urls')),
    path('api/admin/services/', include('services.urls')),
    path('api/admin/feature-requests/', include('feature_requests.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

## Configure JWT for Google OAuth

Create a new file `users/google_auth.py`:

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
import os

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get('token')
    
    try:
        # Verify the token
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), google_client_id)
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return Response({'detail': 'Invalid token issuer'}, status=400)
        
        # Extract user info
        email = idinfo['email']
        name = idinfo.get('name', '')
        
        # Find or create user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Create a new user
            username = email.split('@')[0]
            # Check if username exists
            if User.objects.filter(username=username).exists():
                username = f"{username}{User.objects.count()}"
            
            user = User.objects.create_user(
                email=email,
                username=username,
                name=name,
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
        
    except Exception as e:
        return Response({'detail': str(e)}, status=400)
```

Update `users/urls.py` to add the google login endpoint:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet
from .google_auth import google_login

router = DefaultRouter()
router.register('', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('google/', google_login, name='google_login'),
]
```

## Database Setup

1. Create a PostgreSQL database for your project.

2. Update `settings.py` with your database configuration:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'eigengram_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

3. Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

4. Create a superuser:

```bash
python manage.py createsuperuser
```

## Running the Server

Run the development server:

```bash
python manage.py runserver
```

By default, this will start the server at http://localhost:8000/

## Environment Configuration

Create a `.env` file in the project root to store your environment variables:

```
DEBUG=True
SECRET_KEY=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
DATABASE_URL=postgres://user:password@localhost:5432/eigengram_db
```

Install `django-environ` to use environment variables:

```bash
pip install django-environ
```

Update `settings.py` to use environment variables:

```python
import environ

env = environ.Env()
environ.Env.read_env()

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool('DEBUG', default=False)

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])
```

## API Documentation

Implementing Swagger for API documentation:

1. Install drf-yasg:

```bash
pip install drf-yasg
```

2. Add to `INSTALLED_APPS` in `settings.py`:

```python
INSTALLED_APPS = [
    # ... other apps
    'drf_yasg',
]
```

3. Configure in `urls.py`:

```python
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="Eigengram API",
      default_version='v1',
      description="Eigengram Healthcare Platform API",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # ... other urls
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
```

## Security Considerations

1. Update `settings.py` with proper security settings for production:

```python
# Security settings for production
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'DENY'
```

2. Configure proper CORS settings for production:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Your React development server
    "https://your-production-domain.com",
]

CORS_ALLOW_CREDENTIALS = True
```

## Deployment Considerations

1. Use gunicorn for production deployment:

```bash
pip install gunicorn
gunicorn eigengram_backend.wsgi:application
```

2. Set up a PostgreSQL database server for production.

3. Configure a web server (Nginx or Apache) to serve static files and proxy requests to Django.

4. Set up proper logging configuration for production.

# Connecting React with Django

In your React application, update the API configuration to point to your Django server:

1. Configure CORS properly in Django to allow requests from your React app.
2. Update the React API client to use JWT authentication with your Django endpoints.
3. Ensure proper error handling in React for API requests.

## Testing the Integration

1. Start both servers:
   - Django: `python manage.py runserver`
   - React: `npm start` (or whatever command you use)
   
2. Test the authentication flow:
   - Register a new user
   - Login with the user
   - Verify JWT handling
   
3. Test other API endpoints:
   - Services
   - Subscriptions
   - Feature requests
   - Admin functionalities
