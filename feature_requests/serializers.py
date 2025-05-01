
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
