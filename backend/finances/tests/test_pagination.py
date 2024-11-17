from datetime import datetime, timedelta

from django.urls import reverse
from finances.models import Account, AccountBalanceHistory, AccountType, Bank, Currency
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User


class FinancesPaginationTests(APITestCase):
    def setUp(self):
        # Создаем пользователя
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="Testpass123"
        )
        self.client.force_authenticate(user=self.user)

        # Создаем 20 записей для AccountType
        for i in range(20):
            AccountType.objects.create(name=f"AccountType {i + 1}", owner=self.user)

        # Создаем 20 записей для Bank
        for i in range(20):
            Bank.objects.create(name=f"Bank {i + 1}", country="USA", owner=self.user)

        # Создаем 20 записей для Currency
        for i in range(20):
            Currency.objects.create(
                name=f"Currency {i + 1}",
                code=f"CUR{i + 1}",
                symbol=f"${i + 1}",
                owner=self.user,
            )

        # Создаем 20 записей для Account
        account_type = AccountType.objects.first()
        currency = Currency.objects.first()
        bank = Bank.objects.first()
        for i in range(20):
            Account.objects.create(
                name=f"Account {i + 1}",
                balance=1000 + i,
                owner=self.user,
                account_type=account_type,
                currency=currency,
                bank=bank,
            )

        # Создаем 20 записей для AccountBalanceHistory
        account = Account.objects.first()
        start_date = datetime.now() - timedelta(days=20)
        for i in range(20):
            AccountBalanceHistory.objects.create(
                account=account,
                date=(start_date + timedelta(days=i)).date(),
                balance=1000 + i,
            )

        # URLs для тестов
        self.urls = {
            "accounttype-list": reverse("accounttype-list"),
            "bank-list": reverse("bank-list"),
            "currency-list": reverse("currency-list"),
            "account-list": reverse("account-list"),
            "accountbalancehistory-list": reverse(
                "accountbalancehistory-list", args=[account.id]
            ),
        }

    def test_accounttype_pagination(self):
        """Проверка пагинации для AccountType."""
        response = self.client.get(self.urls["accounttype-list"])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 10)

    def test_bank_pagination(self):
        """Проверка пагинации для Bank."""
        response = self.client.get(self.urls["bank-list"])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 10)

    def test_currency_pagination(self):
        """Проверка пагинации для Currency."""
        response = self.client.get(self.urls["currency-list"])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 10)

    def test_account_pagination(self):
        """Проверка пагинации для Account."""
        response = self.client.get(self.urls["account-list"])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 10)

    # def test_accountbalancehistory_pagination(self):
    #     """Проверка пагинации для AccountBalanceHistory."""
    #     response = self.client.get(self.urls["accountbalancehistory-list"])
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertEqual(len(response.data["results"]), 10)

    def test_pagination_offset(self):
        """Проверка смещения и лимита для Account с учётом текущего порядка."""
        response = self.client.get(
            self.urls["account-list"], {"offset": 10, "limit": 5}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)

        # Сравнение с учётом сортировки по bank, name, currency
        sorted_accounts = Account.objects.filter(
            owner=self.user).order_by("bank", "name", "currency")[10:15]
        expected_names = [account.name for account in sorted_accounts]
        response_names = [item["name"] for item in response.data["results"]]
        self.assertEqual(response_names, expected_names)
