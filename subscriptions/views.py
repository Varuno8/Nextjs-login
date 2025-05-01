
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
