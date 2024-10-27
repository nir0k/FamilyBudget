from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from users.models import User


class APIRouteTests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="Testpass123"
        )
        self.client.force_authenticate(user=self.user)

    def test_user_list_route(self):
        """Test the users list route"""
        url = reverse("user-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_detail_route(self):
        """Test the user detail route"""
        url = reverse("user-detail", args=[self.user.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], self.user.username)

    def test_set_password_route(self):
        """Test the change password route"""
        url = reverse("change-password")
        data = {"current_password": "Testpass123", "new_password": "Newpass123"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_currency_list_route(self):
        """Test the currencies list route"""
        url = reverse("currency-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_account_type_list_route(self):
        """Test the account types list route"""
        url = reverse("account_type-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_bank_list_route(self):
        """Test the banks list route"""
        url = reverse("bank-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_account_list_route(self):
        """Test the accounts list route"""
        url = reverse("account-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_auth_token_route(self):
        """Test the auth token route"""
        url = "/api/v1/auth/token/login/"
        data = {"email": self.user.email, "password": "Testpass123"}
        self.client.logout()
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("auth_token", response.data)
