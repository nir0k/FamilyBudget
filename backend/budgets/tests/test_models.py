# budgets/tests/test_models.py

import datetime

from budgets.models import Budget, BudgetCategory
from django.contrib.auth import get_user_model
from django.test import TestCase
from finances.models import Account, AccountType, Bank, Currency
from transactions.models import Expense, ExpenseCategory

User = get_user_model()


class BudgetModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='password',
            email="testuser@email.com"
        )
        self.currency = Currency.objects.create(
            code='USD',
            name='US Dollar',
            symbol='$',
            owner=self.user
        )
        self.account_type = AccountType.objects.create(
            name='Checking Account',
            owner=self.user
        )
        self.bank = Bank.objects.create(
            name='Test Bank',
            country='Testland',
            owner=self.user
        )
        self.account = Account.objects.create(
            name='Test Account',
            account_type=self.account_type,
            bank=self.bank,
            currency=self.currency,
            balance=1000.00,
            owner=self.user
        )
        self.expense_category = ExpenseCategory.objects.create(
            name='Food', owner=self.user)
        self.budget = Budget.objects.create(
            owner=self.user,
            name='November Budget',
            total_amount=5000.00,
            start_date=datetime.date(2023, 11, 1),
            end_date=datetime.date(2023, 11, 30)
        )
        self.budget_category = BudgetCategory.objects.create(
            budget=self.budget,
            category=self.expense_category,
            amount=2000.00  # Или amount, если вы используете это поле
        )

    def test_budget_creation(self):
        self.assertEqual(self.budget.owner, self.user)
        self.assertEqual(self.budget.name, 'November Budget')
        self.assertEqual(float(self.budget.total_amount), 5000.00)
        self.assertEqual(self.budget.start_date, datetime.date(2023, 11, 1))
        self.assertEqual(self.budget.end_date, datetime.date(2023, 11, 30))

    def test_budget_category_creation(self):
        self.assertEqual(self.budget_category.budget, self.budget)
        self.assertEqual(self.budget_category.category, self.expense_category)
        self.assertEqual(float(self.budget_category.amount), 2000.00)

    def test_budget_total_spent(self):
        # Создаем расходы в рамках бюджета
        Expense.objects.create(
            owner=self.user,
            date=datetime.datetime(2023, 11, 10, 12, 0, 0),
            amount=1500.00,
            currency=self.currency,
            account=self.account,
            description='Groceries',
            category=self.expense_category
        )
        self.assertEqual(float(self.budget.total_spent), 1500.00)

    def test_budget_category_spent(self):
        # Создаем расходы в рамках категории бюджета
        Expense.objects.create(
            owner=self.user,
            date=datetime.datetime(2023, 11, 12, 12, 0, 0),
            amount=500.00,
            currency=self.currency,
            account=self.account,
            description='Restaurant',
            category=self.expense_category
        )
        spent = self.budget.category_spent(self.expense_category)
        self.assertEqual(float(spent), 500.00)
