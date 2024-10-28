from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from finances.models import AccountType, Bank, Currency
from finances.serializers import (
    AccountSerializer,
    AccountTypeSerializer,
    BankSerializer,
    CurrencySerializer,
)
from rest_framework.exceptions import ValidationError

User = get_user_model()


@pytest.fixture
def user():
    return User.objects.create_user(
        username="testuser", password="password", email="testuser@test.com")


@pytest.mark.django_db
def test_currency_serializer_unique_validation(user):
    # Create a Currency instance
    currency_data = {"name": "Dollar", "code": "USD", "symbol": "$"}
    serializer = CurrencySerializer(
        data=currency_data, context={'request': type('obj', (object,), {'user': user})})
    serializer.is_valid(raise_exception=True)
    serializer.save(owner=user)

    # Attempt to create a currency with the same name for the same user
    duplicate_currency_data = {"name": "Dollar", "code": "USD", "symbol": "$"}
    serializer = CurrencySerializer(
        data=duplicate_currency_data,
        context={'request': type('obj', (object,), {'user': user})})

    with pytest.raises(ValidationError) as excinfo:
        serializer.is_valid(raise_exception=True)
    assert "You already have an currency with this name." in str(excinfo.value)


@pytest.mark.django_db
def test_account_type_serializer_unique_validation(user):
    account_type_data = {"name": "Savings"}
    serializer = AccountTypeSerializer(
        data=account_type_data,
        context={'request': type('obj', (object,), {'user': user})}
    )
    serializer.is_valid(raise_exception=True)
    serializer.save(owner=user)

    duplicate_account_type_data = {"name": "Savings"}
    serializer = AccountTypeSerializer(
        data=duplicate_account_type_data,
        context={'request': type('obj', (object,), {'user': user})}
    )

    with pytest.raises(ValidationError) as excinfo:
        serializer.is_valid(raise_exception=True)
    assert "You already have an account type with this name." in str(excinfo.value)


@pytest.mark.django_db
def test_bank_serializer_unique_validation(user):
    bank_data = {"name": "Test Bank", "country": "USA"}
    serializer = BankSerializer(
        data=bank_data, context={'request': type('obj', (object,), {'user': user})})
    serializer.is_valid(raise_exception=True)
    serializer.save(owner=user)

    duplicate_bank_data = {"name": "Test Bank", "country": "USA"}
    serializer = BankSerializer(
        data=duplicate_bank_data,
        context={'request': type('obj', (object,), {'user': user})})

    with pytest.raises(ValidationError) as excinfo:
        serializer.is_valid(raise_exception=True)
    assert "You already have an bank with this name." in str(excinfo.value)


@pytest.mark.django_db
def test_account_serializer_unique_validation(user):
    # Create related objects
    currency = Currency.objects.create(
        name="Dollar", code="USD", symbol="$", owner=user)
    account_type = AccountType.objects.create(name="Savings", owner=user)
    bank = Bank.objects.create(name="Test Bank", country="USA", owner=user)

    # Create an Account instance
    account_data = {
        "name": "Main Account",
        "account_type": account_type.id,
        "bank": bank.id,
        "currency": currency.id,
        "balance": Decimal("1000.00"),
    }
    serializer = AccountSerializer(
        data=account_data, context={'request': type('obj', (object,), {'user': user})})
    serializer.is_valid(raise_exception=True)
    serializer.save(owner=user)

    # Attempt to create an account with the same name for the same user
    duplicate_account_data = {
        "name": "Main Account",
        "account_type": account_type.id,
        "bank": bank.id,
        "currency": currency.id,
        "balance": Decimal("500.00"),
    }
    serializer = AccountSerializer(
        data=duplicate_account_data,
        context={'request': type('obj', (object,), {'user': user})}
    )

    with pytest.raises(ValidationError) as excinfo:
        serializer.is_valid(raise_exception=True)
    assert "You already have an account with this name." in str(excinfo.value)
