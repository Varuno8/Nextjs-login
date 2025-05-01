
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
