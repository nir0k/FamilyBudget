from .serializers import UserSerializer
from .models import User
from rest_framework import viewsets


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
# TODO: Need to fix patch method. now requred password field
