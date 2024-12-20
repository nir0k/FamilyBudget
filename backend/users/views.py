from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import ChangePasswordSerializer, UserSerializer


# TODO: Add post ability for /me endpoint
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(
        detail=False,
        methods=["get", "put", "patch"],
        url_path="me",
        url_name="me",
        permission_classes=[IsAuthenticated],
    )
    def me(self, request):
        user = get_object_or_404(User, pk=request.user.pk)

        if request.method in ["PUT", "PATCH"]:
            serializer = self.get_serializer(
                user, data=request.data, partial=(request.method == "PATCH"))
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(user)
        return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(
        data=request.data, context={"user": request.user}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"detail": "Password updated successfully"}, status=status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LocaleChoicesView(APIView):
    """
    Эндпоинт для получения списка доступных локалей.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        locale_choices = [
            {"value": code, "label": label} for code,
            label in User.LOCALE_CHOICES
        ]
        return Response(locale_choices)
