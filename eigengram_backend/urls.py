
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

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
    path('api/admin/users/', include('users.admin_urls')),
    path('api/admin/services/', include('services.admin_urls')),
    path('api/admin/subscriptions/', include('subscriptions.admin_urls')),
    path('api/admin/feature-requests/', include('feature_requests.admin_urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
