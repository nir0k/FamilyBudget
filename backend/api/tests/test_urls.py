from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from users.models import User
from finances.models import Account, Currency, AccountType, Bank
from transactions.models import IncomeCategory, ExpenseCategory, Income, Expense


class APIRouteTests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="Testpass123"
        )
        self.client.force_authenticate(user=self.user)

        # Create necessary related data for income and expense
        self.currency = Currency.objects.create(
            code="USD", name="US Dollar", symbol="$", owner=self.user
        )
        self.account_type = AccountType.objects.create(
            name="Checking", owner=self.user
        )
        self.bank = Bank.objects.create(
            name="Test Bank", country="Testland", owner=self.user
        )
        self.account = Account.objects.create(
            name="Main Account",
            account_type=self.account_type,
            bank=self.bank,
            currency=self.currency,
            balance=1000.00,
            owner=self.user,
        )

        self.income_category = IncomeCategory.objects.create(
            name="Salary", owner=self.user
        )
        self.expense_category = ExpenseCategory.objects.create(
            name="Food", owner=self.user
        )

        self.income = Income.objects.create(
            date="2023-01-01T12:00:00Z",
            amount=5000.00,
            currency=self.currency,
            account=self.account,
            description="January Salary",
            category=self.income_category,
            owner=self.user,
        )

        self.expense = Expense.objects.create(
            date="2023-01-02T15:00:00Z",
            amount=100.00,
            currency=self.currency,
            account=self.account,
            description="Grocery shopping",
            category=self.expense_category,
            owner=self.user,
        )

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
        url = reverse("accounttype-list")
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

    def test_income_category_list_route(self):
        """Test the income categories list route"""
        url = reverse("incomecategory-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_income_category_detail_route(self):
        """Test the income category detail route"""
        url = reverse("incomecategory-detail", args=[self.income_category.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], self.income_category.name)

    def test_expense_category_list_route(self):
        """Test the expense categories list route"""
        url = reverse("expensecategory-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_expense_category_detail_route(self):
        """Test the expense category detail route"""
        url = reverse("expensecategory-detail", args=[self.expense_category.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], self.expense_category.name)

    def test_income_list_route(self):
        """Test the incomes list route"""
        url = reverse("income-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_income_detail_route(self):
        """Test the income detail route"""
        url = reverse("income-detail", args=[self.income.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data["amount"]), self.income.amount)

    def test_expense_list_route(self):
        """Test the expenses list route"""
        url = reverse("expense-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_expense_detail_route(self):
        """Test the expense detail route"""
        url = reverse("expense-detail", args=[self.expense.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data["amount"]), self.expense.amount)
