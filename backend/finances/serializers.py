from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import Account, AccountType, Bank, Currency


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ("id", "code", "name", "symbol")

    def validate(self, attrs):
        user = self.context['request'].user
        if Currency.objects.filter(name=attrs['name'], owner=user).exists():
            raise ValidationError("You already have an currency with this name.")
        return attrs


class AccountTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountType
        fields = (
            "id",
            "name",
        )

    def validate(self, attrs):
        user = self.context['request'].user
        if AccountType.objects.filter(name=attrs['name'], owner=user).exists():
            raise ValidationError("You already have an account type with this name.")
        return attrs


class BankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bank
        fields = ("id", "name", "country")

    def validate(self, attrs):
        user = self.context['request'].user
        if Bank.objects.filter(name=attrs['name'], owner=user).exists():
            raise ValidationError("You already have an bank with this name.")
        return attrs


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
        )

    def validate(self, attrs):
        user = self.context['request'].user
        if Account.objects.filter(name=attrs['name'], owner=user).exists():
            raise ValidationError("You already have an account with this name.")
        return attrs
