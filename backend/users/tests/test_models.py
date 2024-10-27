from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase

User = get_user_model()


class UserModelTests(TestCase):

    def setUp(self):
        self.email = "test@example.com"
        self.username = "testuser"
        self.password = "Testpass123"

    def test_create_user_with_email_successful(self):
        """Test creating a new user with an email is successful"""
        user = User.objects.create_user(
            username=self.username, email=self.email, password=self.password
        )

        self.assertEqual(user.email, self.email)
        self.assertTrue(user.check_password(self.password))
        self.assertFalse(user.is_admin)
        self.assertFalse(user.is_staff)

    def test_create_user_without_email_raises_error(self):
        """Test creating a user without an email raises a ValueError"""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                username=self.username, email=None, password=self.password
            )

    def test_create_superuser(self):
        """Test creating a new superuser with is_admin and is_staff"""
        superuser = User.objects.create_superuser(
            username="superuser", email="super@example.com", password=self.password
        )

        self.assertTrue(superuser.is_admin)
        self.assertTrue(superuser.is_staff)

    def test_superuser_must_have_admin_and_staff_flags(self):
        """Test that creating superuser without is_admin or is_staff raises an error"""
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                username="superuser",
                email="super@example.com",
                password=self.password,
                is_admin=False,
            )
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                username="superuser",
                email="super@example.com",
                password=self.password,
                is_staff=False,
            )

    def test_user_email_is_normalized(self):
        """Test that the email for a new user is normalized"""
        email = "test@EXAMPLE.COM"
        user = User.objects.create_user(
            username=self.username, email=email, password=self.password
        )

        self.assertEqual(user.email, email.lower())

    def test_duplicate_email_raises_error(self):
        """Test that creating a user with a duplicate email raises an error"""
        User.objects.create_user(
            username="user1", email=self.email, password=self.password
        )
        with self.assertRaises(ValidationError):
            user = User(username="user2", email=self.email)
            user.full_clean()

    def test_username_validator(self):
        """Test the username validator works correctly"""
        invalid_username = "me"
        with self.assertRaises(ValidationError):
            user = User(username=invalid_username, email=self.email)
            user.full_clean()

    def test_user_string_representation(self):
        """Test the user string representation is the username"""
        user = User.objects.create_user(
            username=self.username, email=self.email, password=self.password
        )
        self.assertEqual(str(user), user.username)
