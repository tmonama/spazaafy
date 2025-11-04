# apps/accounts/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        if ser.is_valid():
            user = ser.save()
            # This is correct because the RegisterSerializer's to_representation is called
            return Response(ser.to_representation(user), status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = LoginSerializer(data=request.data, context={"request": request})
        if ser.is_valid():
            # ✅ FIX: Call to_representation on the validated data
            response_data = ser.to_representation(ser.validated_data)
            return Response(response_data, status=status.HTTP_200_OK)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({
            "id": str(u.id),
            "email": u.email,
            "first_name": getattr(u, "first_name", ""),
            "last_name": getattr(u, "last_name", ""),
            "phone": getattr(u, "phone", ""),
            "role": u.role,
        })
    
    # --- THIS IS THE MISSING VIEWSET ---
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing user instances.
    Only accessible by admin users.
    """
    queryset = User.objects.all().order_by('first_name')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]