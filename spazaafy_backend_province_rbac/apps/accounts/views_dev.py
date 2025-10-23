from rest_framework import views, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from apps.shops.models import SpazaShop

User = get_user_model()

def tokens(user):
    r = RefreshToken.for_user(user)
    return {'refresh': str(r), 'access': str(r.access_token)}

class DevEmailLoginView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email = request.data.get('email'); role = request.data.get('role')
        if not email or not role: return Response({'detail':'email and role required'}, status=400)
        role = role if role in dict(User.Roles.choices) else User.Roles.CONSUMER
        user, _ = User.objects.get_or_create(email=email, defaults={'username':email,'role':role})
        if user.role != role: user.role = role; user.save()
        return Response({'user': {'id':user.id,'email':user.email,'first_name':user.first_name,'last_name':user.last_name,'phone':user.phone,'role':user.role}, **tokens(user)})

class DevRegisterBootstrapView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email = request.data.get('email'); role = request.data.get('role') or User.Roles.CONSUMER
        first = request.data.get('first_name') or ''; last = request.data.get('last_name') or ''; phone = request.data.get('phone') or ''
        shopName = request.data.get('shopName'); address = request.data.get('address') or ''; province_id = request.data.get('province_id')
        user, _ = User.objects.get_or_create(email=email, defaults={'username':email,'role':role,'first_name':first,'last_name':last,'phone':phone})
        if role == User.Roles.OWNER and shopName:
            SpazaShop.objects.get_or_create(owner=user, name=shopName, defaults={'address':address, 'province_id': province_id})
        return Response({'user': {'id':user.id,'email':user.email,'first_name':user.first_name,'last_name':user.last_name,'phone':user.phone,'role':user.role}, **tokens(user)}, status=201)
