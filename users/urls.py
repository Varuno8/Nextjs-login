
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
