# transactions/views.py

from itertools import chain

from django.utils import timezone

# from datetime import datetime
from django.utils.dateparse import parse_datetime
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Expense, ExpenseCategory, Income, IncomeCategory
from .serializers import (
    ExpenseCategorySerializer,
    ExpenseSerializer,
    IncomeCategorySerializer,
    IncomeSerializer,
    TransactionSerializer,
)


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ExpenseCategory.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user:
            raise PermissionDenied(
                "You do not have permission to edit this expense category.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            raise PermissionDenied(
                "You do not have permission to delete this expense category.")
        instance.delete()


class IncomeCategoryViewSet(viewsets.ModelViewSet):
    queryset = IncomeCategory.objects.all()
    serializer_class = IncomeCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return IncomeCategory.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user:
            raise PermissionDenied(
                "You do not have permission to edit this income category.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            raise PermissionDenied(
                "You do not have permission to delete this income category.")
        instance.delete()


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Expense.objects.filter(category__owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user:
            raise PermissionDenied("You do not have permission to edit this expense.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            raise PermissionDenied("You do not have permission to delete this expense.")
        instance.delete()


class IncomeViewSet(viewsets.ModelViewSet):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Income.objects.filter(category__owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user:
            raise PermissionDenied("You do not have permission to edit this income.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            raise PermissionDenied("You do not have permission to delete this income.")
        instance.delete()


class CombinedTransactionView(APIView, LimitOffsetPagination):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Получаем параметры фильтрации
        date = request.query_params.get('date')
        datetime_from = request.query_params.get('datetime_from')
        datetime_to = request.query_params.get('datetime_to')
        transaction_type = request.query_params.get('transaction_type')
        account = request.query_params.get('account')
        description = request.query_params.get('description')

        # Инициализируем фильтры
        expense_filters = {'owner': user}
        income_filters = {'owner': user}

        # Фильтрация по дате
        if date:
            date = parse_datetime(date)
            if date is None:
                return Response({'error': 'Invalid date format.'}, status=400)
            if timezone.is_naive(date):
                date = timezone.make_aware(date, timezone.get_current_timezone())
            expense_filters['date__exact'] = date
            income_filters['date__exact'] = date

        if datetime_from:
            datetime_from = parse_datetime(datetime_from)
            if datetime_from is None:
                return Response({'error': 'Invalid datetime_from format.'}, status=400)
            if timezone.is_naive(datetime_from):
                datetime_from = timezone.make_aware(
                    datetime_from, timezone.get_current_timezone())
            expense_filters['date__gte'] = datetime_from
            income_filters['date__gte'] = datetime_from

        if datetime_to:
            datetime_to = parse_datetime(datetime_to)
            if datetime_to is None:
                return Response({'error': 'Invalid datetime_to format.'}, status=400)
            if timezone.is_naive(datetime_to):
                datetime_to = timezone.make_aware(
                    datetime_to, timezone.get_current_timezone())
            expense_filters['date__lte'] = datetime_to
            income_filters['date__lte'] = datetime_to

        # Фильтрация по аккаунту
        if account:
            expense_filters['account__id'] = account
            income_filters['account__id'] = account

        # Фильтрация по описанию
        if description:
            expense_filters['description__icontains'] = description
            income_filters['description__icontains'] = description

        # Фильтрация по категории (опционально, если требуется)
        category = request.query_params.get('category')
        if category:
            expense_filters['category__id'] = category
            income_filters['category__id'] = category

        # Получаем отфильтрованные QuerySet-ы
        expenses = Expense.objects.filter(**expense_filters)
        incomes = Income.objects.filter(**income_filters)

        # Получение параметра сортировки
        ordering = request.query_params.get('ordering', '-date')

        # Применение сортировки
        if transaction_type == 'expense':
            combined_transactions = expenses.order_by(ordering)
        elif transaction_type == 'income':
            combined_transactions = incomes.order_by(ordering)
        else:
            # Объединяем и сортируем транзакции
            combined_transactions = sorted(
                chain(expenses, incomes),
                key=lambda instance: getattr(instance, ordering.strip('-')),
                reverse=ordering.startswith('-')
            )

        # Пагинация и сериализация
        results = self.paginate_queryset(combined_transactions, request, view=self)
        serializer = TransactionSerializer(results, many=True)
        return self.get_paginated_response(serializer.data)
