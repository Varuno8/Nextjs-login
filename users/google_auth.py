
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
import os

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get('token')
    
    try:
        # Verify the token
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), google_client_id)
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return Response({'detail': 'Invalid token issuer'}, status=400)
        
        # Extract user info
        email = idinfo['email']
        name = idinfo.get('name', '')
        
        # Find or create user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Create a new user
            username = email.split('@')[0]
            # Check if username exists
            if User.objects.filter(username=username).exists():
                username = f"{username}{User.objects.count()}"
            
            user = User.objects.create_user(
                email=email,
                username=username,
                name=name,
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
        
    except Exception as e:
        return Response({'detail': str(e)}, status=400)
