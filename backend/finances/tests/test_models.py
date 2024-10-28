import pytest
from django.contrib.auth import get_user_model
from finances.models import Account, AccountType, Bank, Currency

User = get_user_model()


@pytest.fixture
def user():
    return User.objects.create_user(
        username="testuser",
        password="password",
        email="testuser@test.com"
    )


@pytest.mark.django_db
def test_currency_creation(user):
    currency = Currency.objects.create(
        name="US Dollar", code="USD", symbol="$", owner=user)
    assert currency.name == "US Dollar"
    assert str(currency) == "USD"


@pytest.mark.django_db
def test_currency_unique_together_constraint(user):
    Currency.objects.create(name="Euro", code="EUR", symbol="€", owner=user)
    with pytest.raises(Exception):
        Currency.objects.create(name="Euro", code="EUR", symbol="€", owner=user)


@pytest.mark.django_db
def test_account_type_creation(user):
    account_type = AccountType.objects.create(name="Savings", owner=user)
    assert account_type.name == "Savings"
    assert str(account_type) == "Savings"


@pytest.mark.django_db
def test_account_type_unique_together_constraint(user):
    AccountType.objects.create(name="Investment", owner=user)
    with pytest.raises(Exception):
        AccountType.objects.create(name="Investment", owner=user)


@pytest.mark.django_db
def test_bank_creation(user):
    bank = Bank.objects.create(name="Bank of America", country="USA", owner=user)
    assert bank.name == "Bank of America"
    assert str(bank) == "Bank of America"


@pytest.mark.django_db
def test_bank_unique_together_constraint(user):
    Bank.objects.create(name="HSBC", country="UK", owner=user)
    with pytest.raises(Exception):
        Bank.objects.create(name="HSBC", country="UK", owner=user)


@pytest.mark.django_db
def test_account_creation(user):
    currency = Currency.objects.create(name="Euro", code="EUR", symbol="€", owner=user)
    account_type = AccountType.objects.create(name="Checking", owner=user)
    bank = Bank.objects.create(name="Deutsche Bank", country="Germany", owner=user)

    account = Account.objects.create(
        name="Main Account",
        account_type=account_type,
        bank=bank, currency=currency,
        balance=1000.00,
        owner=user
    )
    assert account.name == "Main Account"
    assert str(account) == "Main Account"


@pytest.mark.django_db
def test_account_unique_together_constraint(user):
    currency = Currency.objects.create(name="Pound", code="GBP", symbol="£", owner=user)
    account_type = AccountType.objects.create(name="Investment", owner=user)
    bank = Bank.objects.create(name="HSBC", country="UK", owner=user)

    Account.objects.create(
        name="Investment Account",
        account_type=account_type,
        bank=bank,
        currency=currency,
        balance=5000.00,
        owner=user
    )
    with pytest.raises(Exception):
        Account.objects.create(
            name="Investment Account",
            account_type=account_type,
            bank=bank,
            currency=currency,
            balance=3000.00,
            owner=user
        )
