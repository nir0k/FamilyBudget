from .serializers import UserSerializer, ChangePasswordSerializer
from .models import User
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(
        detail=False,
        methods=['get'],
        url_path='me',
        url_name='me',
        permission_classes=[IsAuthenticated],
    )
    def get_me(self, request):
        self.object = get_object_or_404(User, pk=request.user.pk)
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(
        data=request.data, context={'user': request.user})
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"detail": "Password updated successfully"}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
