from django.contrib.auth import get_user_model
from django.test import TestCase
from finances.models import Account, Account_Type, Bank, Currency
from users.serializers import ChangePasswordSerializer, UserSerializer

User = get_user_model()


class UserSerializerTests(TestCase):

    def setUp(self):
        self.account_type = Account_Type.objects.create(name="Savings")
        self.bank = Bank.objects.create(name="Test Bank", country="Test Country")
        self.currency = Currency.objects.create(name="Dollar", code="USD", symbol="$")
        self.user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "Testpass123",
            "telegram_id": "123456789",
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_create_user_without_accounts(self):
        """Test creating a user without accounts"""
        user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "Newpass123",
            "telegram_id": "987654321",
        }
        serializer = UserSerializer(data=user_data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
        user = serializer.save()

        self.assertEqual(User.objects.count(), 2)  # Учитывая setUp, второй пользователь
        self.assertEqual(Account.objects.count(), 0)
        self.assertEqual(user.accounts.count(), 0)

    def test_get_user_with_accounts(self):
        """Test getting a user with accounts"""
        Account.objects.create(
            owner=self.user,
            name="Account1",
            account_type=self.account_type,
            bank=self.bank,
            currency=self.currency,
            balance="1000.00",
        )
        Account.objects.create(
            owner=self.user,
            name="Account2",
            account_type=self.account_type,
            bank=self.bank,
            currency=self.currency,
            balance="2000.00",
        )

        serializer = UserSerializer(self.user)
        data = serializer.data

        self.assertEqual(len(data["accounts"]), 2)
        self.assertEqual(data["accounts"][0]["name"], "Account1")
        self.assertEqual(data["accounts"][1]["name"], "Account2")

    def test_update_user_without_accounts(self):
        """Test updating a user without accounts"""
        # Используем уже существующего пользователя self.user
        update_data = {
            "username": "updateduser",
            "email": "updated@example.com",
            "telegram_id": "987654321",
        }

        serializer = UserSerializer(self.user, data=update_data, partial=True)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
        user = serializer.save()

        self.assertEqual(user.username, "updateduser")
        self.assertEqual(user.email, "updated@example.com")
        self.assertEqual(user.telegram_id, "987654321")
        self.assertEqual(user.accounts.count(), 0)

    def test_invalid_user_data(self):
        """Test creating a user with invalid data"""
        invalid_data = self.user_data.copy()
        invalid_data["email"] = "not-an-email"
        serializer = UserSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)


class ChangePasswordSerializerTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="Testpass123",
            telegram_id="123456789",
        )

    def test_change_password_success(self):
        """Test changing the password successfully"""
        data = {"current_password": "Testpass123", "new_password": "Newpass123"}
        serializer = ChangePasswordSerializer(data=data, context={"user": self.user})
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
        serializer.save(instance=self.user)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("Newpass123"))

    def test_change_password_incorrect_current_password(self):
        """Test changing the password with incorrect current password"""
        data = {"current_password": "Wrongpass123", "new_password": "Newpass123"}
        serializer = ChangePasswordSerializer(data=data, context={"user": self.user})
        self.assertFalse(serializer.is_valid())
        self.assertIn("current_password", serializer.errors)

    def test_change_password_missing_fields(self):
        """Test changing the password with missing fields"""
        data = {"current_password": "Testpass123"}
        serializer = ChangePasswordSerializer(data=data, context={"user": self.user})
        self.assertFalse(serializer.is_valid())
        self.assertIn("new_password", serializer.errors)
