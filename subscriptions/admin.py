
from django.contrib import admin
from .models import Subscription

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'service', 'status', 'start_date', 'end_date')
    list_filter = ('status',)
    search_fields = ('user__username', 'user__email', 'service__name')
