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


class TransactionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.PrimaryKeyRelatedField(read_only=True)
    account = serializers.PrimaryKeyRelatedField(read_only=True)
    description = serializers.CharField(allow_null=True, allow_blank=True)
    category = serializers.PrimaryKeyRelatedField(read_only=True)
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    transaction_type = serializers.SerializerMethodField()

    def get_date(self, obj):
        return obj.date.date()

    def get_transaction_type(self, obj):
        if isinstance(obj, Expense):
            return 'expense'
        elif isinstance(obj, Income):
            return 'income'
        return None

    def to_representation(self, instance):
        """
        Переопределяем метод для динамической обработки экземпляров Expense и Income.
        """
        representation = super().to_representation(instance)
        # Добавляем логическое поле, чтобы различать тип транзакции
        if isinstance(instance, Expense):
            representation['transaction_type'] = 'expense'
            # Дополнительная обработка для Expense, если нужно
        elif isinstance(instance, Income):
            representation['transaction_type'] = 'income'
            # Дополнительная обработка для Income, если нужно
        return representation
