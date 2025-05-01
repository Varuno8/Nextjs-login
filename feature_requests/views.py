
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import FeatureRequest
from .serializers import FeatureRequestSerializer, FeatureRequestCreateSerializer, AdminFeatureRequestSerializer

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
