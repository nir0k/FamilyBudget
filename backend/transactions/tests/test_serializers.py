# transactions/tests/test_serializers.py

from datetime import datetime, timezone

from django.contrib.auth import get_user_model
from django.test import TestCase
from finances.models import Account, AccountType, Bank, Currency
from rest_framework.exceptions import ValidationError
from transactions.models import Expense, ExpenseCategory, Income, IncomeCategory
from transactions.serializers import (
    ExpenseCategorySerializer,
    ExpenseSerializer,
    IncomeCategorySerializer,
    IncomeSerializer,
)

User = get_user_model()


class ExpenseCategorySerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='password123', email="testuser@test.com"
        )
        self.category_data = {'name': 'Food', 'description': 'Groceries'}

    def test_create_expense_category(self):
        serializer = ExpenseCategorySerializer(
            data=self.category_data, context={'request': self._get_request()}
        )
        self.assertTrue(serializer.is_valid())
        category = serializer.save(owner=self.user)
        self.assertEqual(category.name, 'Food')
        self.assertEqual(category.description, 'Groceries')
        self.assertEqual(category.owner, self.user)

    def test_create_duplicate_category(self):
        ExpenseCategory.objects.create(owner=self.user, **self.category_data)
        serializer = ExpenseCategorySerializer(
            data=self.category_data, context={'request': self._get_request()}
        )
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertIn(
            'You already have an expense category with this name.',
            str(context.exception),
        )

    def test_retrieve_expense_category(self):
        category = ExpenseCategory.objects.create(owner=self.user, **self.category_data)
        serializer = ExpenseCategorySerializer(category)
        self.assertEqual(serializer.data['name'], 'Food')
        self.assertEqual(serializer.data['description'], 'Groceries')

    def test_update_expense_category(self):
        category = ExpenseCategory.objects.create(owner=self.user, **self.category_data)
        updated_data = {'name': 'Utilities', 'description': 'Monthly bills'}
        serializer = ExpenseCategorySerializer(
            category, data=updated_data, context={'request': self._get_request()}
        )
        self.assertTrue(serializer.is_valid())
        updated_category = serializer.save()
        self.assertEqual(updated_category.name, 'Utilities')
        self.assertEqual(updated_category.description, 'Monthly bills')

    def test_delete_expense_category(self):
        category = ExpenseCategory.objects.create(owner=self.user, **self.category_data)
        category_id = category.id
        category.delete()
        self.assertFalse(ExpenseCategory.objects.filter(id=category_id).exists())

    def _get_request(self):
        from rest_framework.test import APIRequestFactory

        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = self.user
        return request


class IncomeCategorySerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='password123', email="testuser@test.com"
        )
        self.category_data = {'name': 'Salary', 'description': 'Monthly salary'}

    def test_create_income_category(self):
        serializer = IncomeCategorySerializer(
            data=self.category_data, context={'request': self._get_request()}
        )
        self.assertTrue(serializer.is_valid())
        category = serializer.save(owner=self.user)
        self.assertEqual(category.name, 'Salary')
        self.assertEqual(category.description, 'Monthly salary')
        self.assertEqual(category.owner, self.user)

    def test_create_duplicate_category(self):
        IncomeCategory.objects.create(owner=self.user, **self.category_data)
        serializer = IncomeCategorySerializer(
            data=self.category_data, context={'request': self._get_request()}
        )
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertIn(
            'You already have an income category with this name.',
            str(context.exception),
        )

    def test_retrieve_income_category(self):
        category = IncomeCategory.objects.create(owner=self.user, **self.category_data)
        serializer = IncomeCategorySerializer(category)
        self.assertEqual(serializer.data['name'], 'Salary')
        self.assertEqual(serializer.data['description'], 'Monthly salary')

    def test_update_income_category(self):
        category = IncomeCategory.objects.create(owner=self.user, **self.category_data)
        updated_data = {'name': 'Bonus', 'description': 'Year-end bonus'}
        serializer = IncomeCategorySerializer(
            category, data=updated_data, context={'request': self._get_request()}
        )
        self.assertTrue(serializer.is_valid())
        updated_category = serializer.save()
        self.assertEqual(updated_category.name, 'Bonus')
        self.assertEqual(updated_category.description, 'Year-end bonus')

    def test_delete_income_category(self):
        category = IncomeCategory.objects.create(owner=self.user, **self.category_data)
        category_id = category.id
        category.delete()
        self.assertFalse(IncomeCategory.objects.filter(id=category_id).exists())

    def _get_request(self):
        from rest_framework.test import APIRequestFactory

        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = self.user
        return request


class ExpenseSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='password123', email="testuser@test.com"
        )
        self.currency = Currency.objects.create(
            code='USD', name='US Dollar', symbol='$', owner=self.user
        )
        self.account_type = AccountType.objects.create(
            name='Checking', owner=self.user
        )
        self.bank = Bank.objects.create(
            name='Test Bank', country='Testland', owner=self.user
        )
        self.account = Account.objects.create(
            name='Checking',
            account_type=self.account_type,
            bank=self.bank,
            currency=self.currency,
            balance=1000.00,
            owner=self.user,
        )
        self.category = ExpenseCategory.objects.create(
            name='Food', owner=self.user
        )
        self.expense_data = {
            'date': '2023-01-01T12:00:00Z',
            'amount': '50.00',
            'currency': self.currency.id,
            'account': self.account.id,
            'description': 'Grocery shopping',
            'category': self.category.id,
        }

    def test_create_expense(self):
        serializer = ExpenseSerializer(
            data=self.expense_data, context={'request': self._get_request()}
        )
        self.assertTrue(serializer.is_valid())
        expense = serializer.save(owner=self.user)
        self.assertEqual(expense.amount, 50.00)
        self.assertEqual(expense.description, 'Grocery shopping')
        self.assertEqual(expense.owner, self.user)

    def test_create_expense_with_other_users_category(self):
        other_user = User.objects.create_user(
            username='otheruser', password='password123', email="otheruser@test.com"
        )
        other_category = ExpenseCategory.objects.create(
            name='Travel', owner=other_user
        )
        self.expense_data['category'] = other_category.id
        serializer = ExpenseSerializer(
            data=self.expense_data, context={'request': self._get_request()}
        )
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertIn(
            'You do not have permission to set this category.',
            str(context.exception),
        )

    def test_retrieve_expense(self):
        expense = Expense.objects.create(owner=self.user, **{
            'date': datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc),
            'amount': 50.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Grocery shopping',
            'category': self.category,
        })
        serializer = ExpenseSerializer(expense)
        self.assertEqual(serializer.data['amount'], '50.00')
        self.assertEqual(serializer.data['description'], 'Grocery shopping')

    def test_update_expense(self):
        expense = Expense.objects.create(owner=self.user, **{
            'date': datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc),
            'amount': 50.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Grocery shopping',
            'category': self.category,
        })
        updated_data = {
            'date': '2023-01-02T12:00:00Z',
            'amount': '75.00',
            'currency': self.currency.id,
            'account': self.account.id,
            'description': 'Supermarket shopping',
            'category': self.category.id,
        }
        serializer = ExpenseSerializer(
            expense, data=updated_data, context={'request': self._get_request()}
        )
        self.assertTrue(serializer.is_valid())
        updated_expense = serializer.save()
        self.assertEqual(updated_expense.amount, 75.00)
        self.assertEqual(updated_expense.description, 'Supermarket shopping')

    def test_delete_expense(self):
        expense = Expense.objects.create(owner=self.user, **{
            'date': datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc),
            'amount': 50.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Grocery shopping',
            'category': self.category,
        })
        expense_id = expense.id
        expense.delete()
        self.assertFalse(Expense.objects.filter(id=expense_id).exists())

    def _get_request(self):
        from rest_framework.test import APIRequestFactory

        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = self.user
        return request


class IncomeSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='password123', email="testuser@test.com"
        )
        self.currency = Currency.objects.create(
            code='USD', name='US Dollar', symbol='$', owner=self.user
        )
        self.account_type = AccountType.objects.create(
            name='Savings', owner=self.user
        )
        self.bank = Bank.objects.create(
            name='Test Bank', country='Testland', owner=self.user
        )
        self.account = Account.objects.create(
            name='Savings',
            account_type=self.account_type,
            bank=self.bank,
            currency=self.currency,
            balance=5000.00,
            owner=self.user,
        )
        self.category = IncomeCategory.objects.create(
            name='Salary', owner=self.user
        )
        self.income_data = {
            'date': '2023-01-15T12:00:00Z',
            'amount': '3000.00',
            'currency': self.currency.id,
            'account': self.account.id,
            'description': 'Monthly salary',
            'category': self.category.id,
        }

    def test_create_income(self):
        serializer = IncomeSerializer(
            data=self.income_data, context={'request': self._get_request()}
        )
        self.assertTrue(serializer.is_valid())
        income = serializer.save(owner=self.user)
        self.assertEqual(income.amount, 3000.00)
        self.assertEqual(income.description, 'Monthly salary')
        self.assertEqual(income.owner, self.user)

    def test_create_income_with_other_users_category(self):
        other_user = User.objects.create_user(
            username='otheruser', password='password123', email="otheruser@test.com"
        )
        other_category = IncomeCategory.objects.create(
            name='Bonus', owner=other_user
        )
        self.income_data['category'] = other_category.id
        serializer = IncomeSerializer(
            data=self.income_data, context={'request': self._get_request()}
        )
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertIn(
            'You do not have permission to set this category.',
            str(context.exception),
        )

    def test_retrieve_income(self):
        income = Income.objects.create(owner=self.user, **{
            'date': datetime(2023, 1, 15, 12, 0, 0, tzinfo=timezone.utc),
            'amount': 3000.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Monthly salary',
            'category': self.category,
        })
        serializer = IncomeSerializer(income)
        self.assertEqual(serializer.data['amount'], '3000.00')
        self.assertEqual(serializer.data['description'], 'Monthly salary')

    def test_update_income(self):
        income = Income.objects.create(owner=self.user, **{
            'date': datetime(2023, 1, 15, 12, 0, 0, tzinfo=timezone.utc),
            'amount': 3000.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Monthly salary',
            'category': self.category,
        })
        updated_data = {
            'date': '2023-01-16T12:00:00Z',
            'amount': '3200.00',
            'currency': self.currency.id,
            'account': self.account.id,
            'description': 'Monthly salary with bonus',
            'category': self.category.id,
        }
        serializer = IncomeSerializer(
            income, data=updated_data, context={'request': self._get_request()}
        )
        self.assertTrue(serializer.is_valid())
        updated_income = serializer.save()
        self.assertEqual(updated_income.amount, 3200.00)
        self.assertEqual(updated_income.description, 'Monthly salary with bonus')

    def test_delete_income(self):
        income = Income.objects.create(owner=self.user, **{
            'date': datetime(2023, 1, 15, 12, 0, 0, tzinfo=timezone.utc),
            'amount': 3000.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Monthly salary',
            'category': self.category,
        })
        income_id = income.id
        income.delete()
        self.assertFalse(Income.objects.filter(id=income_id).exists())

    def _get_request(self):
        from rest_framework.test import APIRequestFactory

        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = self.user
        return request
