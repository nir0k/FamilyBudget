# budgets/models.py

from django.contrib.auth import get_user_model
from django.db import models
from transactions.models import ExpenseCategory
from django.utils.timezone import make_aware, is_naive
from datetime import datetime

User = get_user_model()


class Budget(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    name = models.CharField(max_length=100)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.name} ({self.start_date} - {self.end_date})'

    @property
    def total_spent(self):
        from transactions.models import Expense
        start_datetime = datetime.combine(self.start_date, datetime.min.time())
        end_datetime = datetime.combine(self.end_date, datetime.max.time())
        if is_naive(start_datetime):
            start_datetime = make_aware(start_datetime)
        if is_naive(end_datetime):
            end_datetime = make_aware(end_datetime)
        expenses = Expense.objects.filter(
            owner=self.owner,
            date__range=(start_datetime, end_datetime)
        )
        total = expenses.aggregate(total=models.Sum('amount'))['total'] or 0
        return total

    def category_spent(self, category):
        from transactions.models import Expense
        start_datetime = datetime.combine(self.start_date, datetime.min.time())
        end_datetime = datetime.combine(self.end_date, datetime.max.time())
        if is_naive(start_datetime):
            start_datetime = make_aware(start_datetime)
        if is_naive(end_datetime):
            end_datetime = make_aware(end_datetime)

        expenses = Expense.objects.filter(
            owner=self.owner,
            category=category,
            date__range=(start_datetime, end_datetime)
        )
        total = expenses.aggregate(total=models.Sum('amount'))['total'] or 0
        return total


class BudgetCategory(models.Model):
    budget = models.ForeignKey(
        Budget, on_delete=models.CASCADE, related_name='budget_categories')
    category = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.category.name} - {self.amount}'
