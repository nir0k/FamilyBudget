from rest_framework import serializers

from .models import Account, Account_Type, Bank, Currency


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ("id", "code", "name", "symbol")


class Account_TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account_Type
        fields = (
            "id",
            "name",
        )


class BankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bank
        fields = ("id", "name", "country")


class AccountSerializer(serializers.ModelSerializer):

    class Meta:
        model = Account
        fields = (
            "id",
            "name",
            "account_type",
            "bank",
            "currency",
            "balance",
            "owner",
        )
