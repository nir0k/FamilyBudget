# finances/management/commands/generate_test_data.py
import random
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone
from finances.models import Account, AccountType, Bank, Currency
from transactions.models import Expense, Income, ExpenseCategory, IncomeCategory

User = get_user_model()


class Command(BaseCommand):
    help = (
        'Generate test data for transactions over the past 60 days '
        'for multiple accounts'
    )

    def handle(self, *args, **options):
        user, _ = User.objects.get_or_create(
            username='testuser',
            defaults={'password': 'password', 'email': 'testuser@example.com'}
        )

        # Создание счетов и связанных данных
        account_type, _ = AccountType.objects.get_or_create(name="Savings", owner=user)
        currency, _ = Currency.objects.get_or_create(
            name="Dollar", code="USD", symbol="$", owner=user)
        bank, _ = Bank.objects.get_or_create(
            name="Test Bank", country="USA", owner=user)

        # Создание счетов
        account_names = ["Main Account", "Secondary Account"]
        accounts = []
        for account_name in account_names:
            account, _ = Account.objects.get_or_create(
                name=account_name,
                defaults={
                    'balance': Decimal("1000.00"),
                    'owner': user,
                    'account_type': account_type,
                    'currency': currency,
                    'bank': bank
                }
            )
            accounts.append(account)

        # Создание категорий для доходов и расходов
        expense_categories = ["Food", "Transport", "Entertainment", "Utilities"]
        income_categories = ["Salary", "Freelance"]
        expense_category_objects = [
            ExpenseCategory.objects.get_or_create(name=name, owner=user)[0]
            for name in expense_categories
        ]
        income_category_objects = [
            IncomeCategory.objects.get_or_create(name=name, owner=user)[0]
            for name in income_categories
        ]

        # Генерация расходов за последние 60 дней
        start_date = timezone.now() - timedelta(days=60)
        for day in range(60):
            date = start_date + timedelta(days=day)
            for account in accounts:
                for category in random.sample(expense_category_objects, k=2):
                    Expense.objects.create(
                        date=date,
                        amount=Decimal(random.uniform(5, 50)).quantize(Decimal("0.01")),
                        currency=currency,
                        account=account,
                        description=f"{category.name} expense",
                        category=category,
                        owner=user,
                    )

        # Генерация доходов для каждого счета (по 4 транзакции за период)
        income_dates = [start_date + timedelta(days=i * 15) for i in range(4)]
        for account in accounts:
            for category in income_category_objects:
                for date in income_dates:
                    Income.objects.create(
                        date=date,
                        amount=Decimal(
                            random.uniform(1000, 3000)).quantize(Decimal("0.01")),
                        currency=currency,
                        account=account,
                        description=f"{category.name} income",
                        category=category,
                        owner=user,
                    )

        self.stdout.write(self.style.SUCCESS('Test data generated successfully'))
