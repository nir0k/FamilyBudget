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
        balance=1000.00,
        currency=currency,
        owner=user
    )


@pytest.mark.django_db
def test_expense_category_creation(user):
    category = ExpenseCategory.objects.create(name="Food", owner=user)
    assert category.name == "Food"
    assert category.owner == user
    assert str(category) == "Food"


@pytest.mark.django_db
def test_income_category_creation(user):
    category = IncomeCategory.objects.create(name="Salary", owner=user)
    assert category.name == "Salary"
    assert category.owner == user
    assert str(category) == "Salary"


@pytest.mark.django_db
def test_expense_category_unique_constraint(user):
    ExpenseCategory.objects.create(name="Transport", owner=user)
    with pytest.raises(Exception):
        ExpenseCategory.objects.create(name="Transport", owner=user)


@pytest.mark.django_db
def test_income_category_unique_constraint(user):
    IncomeCategory.objects.create(name="Investment", owner=user)
    with pytest.raises(Exception):
        IncomeCategory.objects.create(name="Investment", owner=user)


@pytest.mark.django_db
def test_expense_creation(user, account):
    category = ExpenseCategory.objects.create(name="Groceries", owner=user)
    expense = Expense.objects.create(
        category=category,
        amount=50.00,
        account=account,
        currency=account.currency,
        date=timezone.now(),
        description="Grocery shopping",
        owner=user,
    )
    assert expense.amount == 50.00
    assert expense.category == category
    assert expense.account == account
    assert expense.currency == account.currency
    assert expense.owner == user
    assert str(expense) == "Grocery shopping"


@pytest.mark.django_db
def test_income_creation(user, account):
    category = IncomeCategory.objects.create(name="Freelancing", owner=user)
    income = Income.objects.create(
        category=category,
        amount=500.00,
        account=account,
        currency=account.currency,
        date=timezone.now(),
        description="Freelance project payment",
        owner=user,
    )
    assert income.amount == 500.00
    assert income.category == category
    assert income.account == account
    assert income.currency == account.currency
    assert income.owner == user
    assert str(income) == "Freelance project payment"


@pytest.mark.django_db
def test_default_currency(user, account):
    category = ExpenseCategory.objects.create(name="Utilities", owner=user)
    expense = Expense.objects.create(
        category=category,
        amount=100.00,
        account=account,
        date=timezone.now(),
        description="Electricity bill",
        owner=user,
    )

    assert expense.currency == account.currency
