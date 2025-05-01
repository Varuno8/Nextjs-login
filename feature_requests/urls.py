
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeatureRequestViewSet

router = DefaultRouter()
# router.register('', FeatureRequestViewSet)
router.register('', FeatureRequestViewSet, basename='feature-request')

urlpatterns = [
    path('', include(router.urls)),
]
