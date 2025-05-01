
from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_stats),
    path('users/', views.user_growth),
    path('subscriptions/', views.subscription_analytics),
]
