from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User
from finances.models import Account, Account_Type, Bank, Currency


class UserViewSetTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.account_type = Account_Type.objects.create(name="Savings")
        self.bank = Bank.objects.create(name="Test Bank", country="Test Country")
        self.currency = Currency.objects.create(name="Dollar", code="USD", symbol="$")
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='Testpass123',
            telegram_id='123456789'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_user(self):
        """Test creating a new user"""
        url = reverse('user-list')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'Newpass123',
            'telegram_id': '987654321'
        }
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)
        self.assertEqual(User.objects.get(id=response.data['id']).username, 'newuser')

    def test_list_users(self):
        """Test listing all users"""
        url = reverse('user-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], self.user.username)

    def test_retrieve_user(self):
        """Test retrieving a single user"""
        url = reverse('user-detail', args=[self.user.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)

    def test_update_user_put(self):
        """Test updating a user with PUT"""
        url = reverse('user-detail', args=[self.user.id])
        data = {
            'username': 'updateduser',
            'email': 'updated@example.com',
            'password': 'Updatedpass123',
            'telegram_id': '987654321'
        }
        response = self.client.put(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'updateduser')
        self.assertEqual(self.user.email, 'updated@example.com')

    def test_update_user_patch(self):
        """Test updating a user with PATCH"""
        url = reverse('user-detail', args=[self.user.id])
        data = {
            'username': 'patcheduser'
        }
        response = self.client.patch(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'patcheduser')

    def test_get_me(self):
        """Test retrieving the authenticated user's data"""
        url = reverse('user-me')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['email'], self.user.email)

    def test_get_me_with_accounts(self):
        """Test retrieving the authenticated user's data with accounts"""
        Account.objects.create(
            owner=self.user,
            name='Account1',
            account_type=self.account_type,
            bank=self.bank,
            currency=self.currency,
            balance='1000.00'
        )
        Account.objects.create(
            owner=self.user,
            name='Account2',
            account_type=self.account_type,
            bank=self.bank,
            currency=self.currency,
            balance='2000.00'
        )

        url = reverse('user-me')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['accounts']), 2)
        self.assertEqual(response.data['accounts'][0]['name'], 'Account1')
        self.assertEqual(response.data['accounts'][1]['name'], 'Account2')

    def test_get_me_unauthenticated(self):
        """Test retrieving the authenticated user's data without authentication"""
        self.client.force_authenticate(user=None)
        url = reverse('user-me')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password_success(self):
        """Test changing the password successfully"""
        url = reverse('change-password')
        data = {
            'current_password': 'Testpass123',
            'new_password': 'Newpass123'
        }
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('Newpass123'))

    def test_change_password_incorrect_current_password(self):
        """Test changing the password with incorrect current password"""
        url = reverse('change-password')
        data = {
            'current_password': 'Wrongpass123',
            'new_password': 'Newpass123'
        }
        response = self.client.post(url, data)

        self.assertEqual(response.data['current_password'][0],
                         'Current password is not correct')
        self.assertIn('current_password', response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('Testpass123'))

    def test_change_password_unauthenticated(self):
        """Test changing the password without authentication"""
        self.client.force_authenticate(user=None)
        url = reverse('change-password')
        data = {
            'current_password': 'Testpass123',
            'new_password': 'Newpass123'
        }
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
