from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from finances.models import Account, AccountType, Bank, Currency
from transactions.models import Expense, ExpenseCategory, Income, IncomeCategory

User = get_user_model()


@pytest.fixture
def user():
    return User.objects.create_user(
        username="testuser", password="password", email="testuser@test.com")


@pytest.fixture
def account(user):
    currency = Currency.objects.create(
        name="Dollar", code="USD", symbol="$", owner=user)
    account_type = AccountType.objects.create(name="Savings", owner=user)
    bank = Bank.objects.create(name="Test Bank", country="Test Country", owner=user)

    return Account.objects.create(
        name="Main Account",
        account_type=account_type,
        bank=bank,
        balance=Decimal("1000.00"),
        currency=currency,
        owner=user
    )


@pytest.mark.django_db
def test_expense_creation_updates_balance(user, account):
    category = ExpenseCategory.objects.create(name="Groceries", owner=user)
    initial_balance = account.balance

    expense = Expense.objects.create(  # noqa: F841
        category=category,
        amount=Decimal("100.00"),
        account=account,
        currency=account.currency,
        date=timezone.now(),
        description="Grocery shopping",
        owner=user,
    )

    account.refresh_from_db()
    assert account.balance == initial_balance - Decimal("100.00")


@pytest.mark.django_db
def test_expense_update_updates_balance(user, account):
    category = ExpenseCategory.objects.create(name="Groceries", owner=user)
    expense = Expense.objects.create(
        category=category,
        amount=Decimal("100.00"),
        account=account,
        currency=account.currency,
        date=timezone.now(),
        description="Grocery shopping",
        owner=user,
    )

    initial_balance = account.balance
    expense.amount = Decimal("50.00")
    expense.save()

    account.refresh_from_db()
    # The balance should become 950.00 after reducing the transaction amount
    assert account.balance == initial_balance + Decimal("50.00")


@pytest.mark.django_db
def test_expense_deletion_updates_balance(user, account):
    category = ExpenseCategory.objects.create(name="Groceries", owner=user)
    expense = Expense.objects.create(
        category=category,
        amount=Decimal("100.00"),
        account=account,
        currency=account.currency,
        date=timezone.now(),
        description="Grocery shopping",
        owner=user,
    )

    initial_balance = account.balance
    expense.delete()

    account.refresh_from_db()
    assert account.balance == initial_balance + Decimal("100.00")


@pytest.mark.django_db
def test_income_creation_updates_balance(user, account):
    category = IncomeCategory.objects.create(name="Salary", owner=user)
    initial_balance = account.balance

    income = Income.objects.create(  # noqa: F841
        category=category,
        amount=Decimal("200.00"),
        account=account,
        currency=account.currency,
        date=timezone.now(),
        description="Monthly salary",
        owner=user,
    )

    account.refresh_from_db()
    assert account.balance == initial_balance + Decimal("200.00")


@pytest.mark.django_db
def test_income_update_updates_balance(user, account):
    category = IncomeCategory.objects.create(name="Salary", owner=user)
    income = Income.objects.create(
        category=category,
        amount=Decimal("200.00"),
        account=account,
        currency=account.currency,
        date=timezone.now(),
        description="Monthly salary",
        owner=user,
    )

    initial_balance = account.balance
    income.amount = Decimal("300.00")
    income.save()

    account.refresh_from_db()
    # 300 - 200 (new amount - old amount)
    assert account.balance == initial_balance + Decimal("100.00")


@pytest.mark.django_db
def test_income_deletion_updates_balance(user, account):
    category = IncomeCategory.objects.create(name="Salary", owner=user)
    income = Income.objects.create(
        category=category,
        amount=Decimal("200.00"),
        account=account,
        currency=account.currency,
        date=timezone.now(),
        description="Monthly salary",
        owner=user,
    )

    initial_balance = account.balance
    income.delete()

    account.refresh_from_db()
    assert account.balance == initial_balance - Decimal("200.00")
