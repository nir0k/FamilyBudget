from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from finances.models import Account, AccountBalanceHistory, AccountType, Bank, Currency
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(
        username="testuser", password="password", email="testuser@test.com"
    )


@pytest.fixture
def account(user):
    currency = Currency.objects.create(
        name="Dollar", code="USD", symbol="$", owner=user
    )
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


@pytest.fixture
def another_user():
    return User.objects.create_user(
        username="anotheruser", password="password", email="anotheruser@test.com")


@pytest.mark.django_db
def test_currency_viewset_list(client, user):
    client.force_authenticate(user=user)
    Currency.objects.create(name="Dollar", code="USD", symbol="$", owner=user)

    response = client.get("/api/v1/currencies/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["name"] == "Dollar"


@pytest.mark.django_db
def test_currency_viewset_create(client, user):
    client.force_authenticate(user=user)
    data = {"name": "Euro", "code": "EUR", "symbol": "€"}

    response = client.post("/api/v1/currencies/", data)
    assert response.status_code == status.HTTP_201_CREATED
    assert Currency.objects.filter(name="Euro", owner=user).exists()


@pytest.mark.django_db
def test_currency_viewset_update_permission_denied(client, user, another_user):
    currency = Currency.objects.create(
        name="Dollar", code="USD", symbol="$", owner=another_user
    )
    client.force_authenticate(user=user)

    # Attempt to update a resource owned by another user
    response = client.patch(
        f"/api/v1/currencies/{currency.id}/", {"name": "Dollar Updated"})
    assert response.status_code == status.HTTP_404_NOT_FOUND, \
        f"Expected 404, got {response.status_code} instead"


@pytest.mark.django_db
def test_currency_viewset_delete_permission_denied(client, user, another_user):
    currency = Currency.objects.create(
        name="Dollar", code="USD", symbol="$", owner=another_user
    )
    client.force_authenticate(user=user)

    # Attempt to delete a resource owned by another user
    response = client.delete(f"/api/v1/currencies/{currency.id}/")
    assert response.status_code == status.HTTP_404_NOT_FOUND, \
        f"Expected 404, got {response.status_code} instead"


@pytest.mark.django_db
def test_accounttype_viewset_create(client, user):
    client.force_authenticate(user=user)
    data = {"name": "Savings"}

    response = client.post("/api/v1/accountTypes/", data)
    assert response.status_code == status.HTTP_201_CREATED
    assert AccountType.objects.filter(name="Savings", owner=user).exists()


@pytest.mark.django_db
def test_bank_viewset_create(client, user):
    client.force_authenticate(user=user)
    data = {"name": "Test Bank", "country": "USA"}

    response = client.post("/api/v1/banks/", data)
    assert response.status_code == status.HTTP_201_CREATED
    assert Bank.objects.filter(name="Test Bank", owner=user).exists()


@pytest.mark.django_db
def test_account_viewset_create(client, user):
    client.force_authenticate(user=user)
    currency = Currency.objects.create(
        name="Dollar", code="USD", symbol="$", owner=user
    )
    account_type = AccountType.objects.create(name="Savings", owner=user)
    bank = Bank.objects.create(name="Test Bank", country="USA", owner=user)

    data = {
        "name": "Main Account",
        "account_type": account_type.id,
        "bank": bank.id,
        "currency": currency.id,
        "balance": "1000.00",
    }

    response = client.post("/api/v1/accounts/", data)
    assert response.status_code == status.HTTP_201_CREATED
    assert Account.objects.filter(name="Main Account", owner=user).exists()


@pytest.mark.django_db
def test_account_viewset_update_permission_denied(client, user, another_user):
    currency = Currency.objects.create(
        name="Dollar", code="USD", symbol="$", owner=another_user
    )
    account_type = AccountType.objects.create(name="Savings", owner=another_user)
    bank = Bank.objects.create(name="Test Bank", country="USA", owner=another_user)
    account = Account.objects.create(
        name="Another Account",
        account_type=account_type,
        bank=bank,
        currency=currency,
        balance="500.00",
        owner=another_user
    )

    client.force_authenticate(user=user)
    # Expecting 404, as the user should not see or edit records owned by others
    response = client.put(
        f"/api/v1/accounts/{account.id}/", {"name": "Updated Account"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND, \
        f"Expected 404, got {response.status_code} instead"


@pytest.mark.django_db
def test_account_viewset_delete_permission_denied(client, user, another_user):
    currency = Currency.objects.create(
        name="Dollar", code="USD", symbol="$", owner=another_user
    )
    account_type = AccountType.objects.create(name="Savings", owner=another_user)
    bank = Bank.objects.create(name="Test Bank", country="USA", owner=another_user)
    account = Account.objects.create(
        name="Another Account",
        account_type=account_type,
        bank=bank,
        currency=currency,
        balance="500.00",
        owner=another_user
    )

    client.force_authenticate(user=user)
    # Expecting 404, as the user should not see or delete records owned by others
    response = client.delete(f"/api/v1/accounts/{account.id}/")
    assert response.status_code == status.HTTP_404_NOT_FOUND, \
        f"Expected 404, got {response.status_code} instead"


@pytest.mark.django_db
def test_account_balance_history_view(client, user, account):
    client.force_authenticate(user=user)

    # Create several balance history records
    AccountBalanceHistory.objects.create(
        account=account, balance=Decimal("1000.00"), date=timezone.now())
    AccountBalanceHistory.objects.create(
        account=account, balance=Decimal("1200.00"), date=timezone.now())

    response = client.get(f"/api/v1/accounts/{account.id}/balance-history/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2
    assert response.data[0]["balance"] == Decimal("1000.00")
    assert response.data[1]["balance"] == Decimal("1200.00")
