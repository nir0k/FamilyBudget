from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User


class UserPaginationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="password123"
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse("user-list")

        for i in range(20):
            User.objects.create_user(
                username=f"testuser{i}",
                email=f"test{i}@example.com",
                password="password"
            )

    def test_default_pagination(self):
        """Проверка пагинации с настройками по умолчанию (10 пользователей)."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 10)  # По умолчанию 10

    def test_custom_pagination_limit(self):
        """Проверка пагинации с пользовательским параметром limit=5."""
        response = self.client.get(self.url, {"limit": 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)

    def test_pagination_offset(self):
        """Проверка смещения через параметр offset."""
        response = self.client.get(self.url, {"offset": 10, "limit": 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)

        # Убедимся, что пользователи сортируются по username
        sorted_users = User.objects.order_by("username")[10:15]
        expected_usernames = [user.username for user in sorted_users]
        actual_usernames = [user["username"] for user in response.data["results"]]

        self.assertEqual(actual_usernames, expected_usernames)
