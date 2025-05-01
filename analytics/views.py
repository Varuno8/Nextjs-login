
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
    elif period == 'month':
        days = 30
    elif period == 'year':
        days = 365
    else:
        days = 30
    
    start_date = timezone.now() - timedelta(days=days)
    
    users = User.objects.filter(
        date_joined__gte=start_date,
        role='USER'
    )
    
    # Group by date
    users_by_date = {}
    
    for user in users:
        if period == 'year':
            date_key = user.date_joined.strftime('%Y-%m')
        else:
            date_key = user.date_joined.strftime('%Y-%m-%d')
            
        if date_key not in users_by_date:
            users_by_date[date_key] = 0
        users_by_date[date_key] += 1
    
    result = [{'period': k, 'count': v} for k, v in users_by_date.items()]
    return Response(sorted(result, key=lambda x: x['period']))

@api_view(['GET'])
@permission_classes([IsAdminUser])
def subscription_analytics(request):
    # Get counts by service
    services = Service.objects.all()
    result = []
    
    for service in services:
        active = Subscription.objects.filter(service=service, status='ACTIVE').count()
        canceled = Subscription.objects.filter(service=service, status='CANCELED').count()
        pending = Subscription.objects.filter(service=service, status='PENDING').count()
        expired = Subscription.objects.filter(service=service, status='EXPIRED').count()
        total = active + canceled + pending + expired
        
        result.append({
            'name': service.name,
            'total': total,
            'active': active,
            'canceled': canceled,
            'pending': pending,
            'expired': expired,
        })
    
    return Response(result)
