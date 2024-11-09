# transactions/serializers.py

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import Expense, ExpenseCategory, Income, IncomeCategory


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ("id", "name", "description")

    def validate(self, attrs):
        user = self.context['request'].user
        category_id = self.instance.id if self.instance else None
        if ExpenseCategory.objects.filter(
            name=attrs['name'], owner=user
        ).exclude(id=category_id).exists():
            raise ValidationError(
                "You already have an expense category with this name.")
        return attrs


class IncomeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeCategory
        fields = ("id", "name", "description")

    def validate(self, attrs):
        user = self.context['request'].user
        category_id = self.instance.id if self.instance else None
        if IncomeCategory.objects.filter(
            name=attrs['name'], owner=user
        ).exclude(id=category_id).exists():
            raise ValidationError("You already have an income category with this name.")
        return attrs


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = (
            "id",
            "date",
            "amount",
            "currency",
            "account",
            "description",
            "category",
        )

    def validate(self, attrs):
        user = self.context['request'].user
        if attrs['category'].owner != user:
            raise ValidationError("You do not have permission to set this category.")
        return attrs


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = (
            "id",
            "date",
            "amount",
            "currency",
            "account",
            "description",
            "category",
        )

    def validate(self, attrs):
        user = self.context['request'].user
        if attrs['category'].owner != user:
            raise ValidationError("You do not have permission to set this category.")
        return attrs
