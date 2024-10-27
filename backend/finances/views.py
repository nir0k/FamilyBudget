from rest_framework import viewsets

from .models import Account, Account_Type, Bank, Currency
from .serializers import (
    Account_TypeSerializer,
    AccountSerializer,
    BankSerializer,
    CurrencySerializer,
)


class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer


class Account_TypeViewSet(viewsets.ModelViewSet):
    queryset = Account_Type.objects.all()
    serializer_class = Account_TypeSerializer


class BankViewSet(viewsets.ModelViewSet):
    queryset = Bank.objects.all()
    serializer_class = BankSerializer


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
