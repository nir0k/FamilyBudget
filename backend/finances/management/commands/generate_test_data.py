# finances/management/commands/generate_test_data.py
import random
from datetime import datetime, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from finances.models import Account, AccountBalanceHistory, AccountType, Bank, Currency

User = get_user_model()


class Command(BaseCommand):
    help = (
        'Generate test data for account balance history for the past 30 days '
        'for multiple accounts'
    )

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={'password': 'password', 'email': 'testuser@example.com'}
        )

        account_type, _ = AccountType.objects.get_or_create(name="Savings", owner=user)
        currency, _ = Currency.objects.get_or_create(
            name="Dollar", code="USD", symbol="$", owner=user)
        bank, _ = Bank.objects.get_or_create(
            name="Test Bank", country="USA", owner=user)

        account_names = ["Main Account", "Secondary Account", "Savings Account"]
        start_balances = [Decimal("1000.00"), Decimal("500.00"), Decimal("2000.00")]
        start_date_offsets = [0, 5, 10]  # Различные сдвиги начала дат

        for index, (account_name, start_balance, offset) in enumerate(
            zip(account_names, start_balances, start_date_offsets)
        ):
            account, created = Account.objects.get_or_create(
                name=account_name,
                defaults={
                    'balance': start_balance,
                    'owner': user,
                    'account_type': account_type,
                    'currency': currency,
                    'bank': bank
                }
            )

            current_balance = start_balance
            start_date = datetime.now() - timedelta(days=30 + offset)

            for i in range(30):
                date = start_date + timedelta(days=i)
                daily_change = Decimal(
                    random.uniform(-20, 20)).quantize(Decimal("0.01"))
                current_balance += daily_change

                if current_balance < 0:
                    current_balance = Decimal("0.00")

                AccountBalanceHistory.objects.create(
                    account=account,
                    date=date.date(),  # Устанавливаем конкретную дату
                    balance=current_balance
                )

        self.stdout.write(self.style.SUCCESS(
            'Realistic test data for 3 accounts generated successfully'))
