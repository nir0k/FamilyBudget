# transactions/tests/test_views.py

from django.contrib.auth import get_user_model
from django.urls import reverse
from finances.models import Account, AccountType, Bank, Currency
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from transactions.models import Expense, ExpenseCategory, Income, IncomeCategory

User = get_user_model()


class ExpenseCategoryViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='password123', email='testuser@test.com'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.category_data = {'name': 'Food', 'description': 'Groceries'}
        self.url = reverse('expensecategory-list')

    def test_create_expense_category(self):
        response = self.client.post(self.url, self.category_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ExpenseCategory.objects.count(), 1)
        category = ExpenseCategory.objects.get()
        self.assertEqual(category.name, 'Food')
        self.assertEqual(category.description, 'Groceries')
        self.assertEqual(category.owner, self.user)

    def test_list_expense_categories(self):
        ExpenseCategory.objects.create(owner=self.user, **self.category_data)
        response = self.client.get(self.url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_expense_category(self):
        category = ExpenseCategory.objects.create(owner=self.user, **self.category_data)
        url = reverse('expensecategory-detail', args=[category.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Food')

    def test_update_expense_category(self):
        category = ExpenseCategory.objects.create(owner=self.user, **self.category_data)
        url = reverse('expensecategory-detail', args=[category.id])
        updated_data = {'name': 'Utilities', 'description': 'Monthly bills'}
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        category.refresh_from_db()
        self.assertEqual(category.name, 'Utilities')
        self.assertEqual(category.description, 'Monthly bills')

    def test_delete_expense_category(self):
        category = ExpenseCategory.objects.create(owner=self.user, **self.category_data)
        url = reverse('expensecategory-detail', args=[category.id])
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ExpenseCategory.objects.filter(id=category.id).exists())

    def test_permission_denied_for_other_user(self):
        other_user = User.objects.create_user(
            username='otheruser', password='password123', email='otheruser@test.com'
        )
        category = ExpenseCategory.objects.create(
            owner=other_user, **self.category_data)
        url = reverse('expensecategory-detail', args=[category.id])

        # Attempt to retrieve
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Attempt to update
        updated_data = {'name': 'Travel'}
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Attempt to delete
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class IncomeCategoryViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='password123', email='testuser@test.com'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.category_data = {'name': 'Salary', 'description': 'Monthly salary'}
        self.url = reverse('incomecategory-list')

    def test_create_income_category(self):
        response = self.client.post(self.url, self.category_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(IncomeCategory.objects.count(), 1)
        category = IncomeCategory.objects.get()
        self.assertEqual(category.name, 'Salary')
        self.assertEqual(category.description, 'Monthly salary')
        self.assertEqual(category.owner, self.user)

    def test_list_income_categories(self):
        IncomeCategory.objects.create(owner=self.user, **self.category_data)
        response = self.client.get(self.url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_income_category(self):
        category = IncomeCategory.objects.create(owner=self.user, **self.category_data)
        url = reverse('incomecategory-detail', args=[category.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Salary')

    def test_update_income_category(self):
        category = IncomeCategory.objects.create(owner=self.user, **self.category_data)
        url = reverse('incomecategory-detail', args=[category.id])
        updated_data = {'name': 'Bonus', 'description': 'Year-end bonus'}
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        category.refresh_from_db()
        self.assertEqual(category.name, 'Bonus')
        self.assertEqual(category.description, 'Year-end bonus')

    def test_delete_income_category(self):
        category = IncomeCategory.objects.create(owner=self.user, **self.category_data)
        url = reverse('incomecategory-detail', args=[category.id])
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(IncomeCategory.objects.filter(id=category.id).exists())

    def test_permission_denied_for_other_user(self):
        other_user = User.objects.create_user(
            username='otheruser', password='password123', email='otheruser@test.com'
        )
        category = IncomeCategory.objects.create(owner=other_user, **self.category_data)
        url = reverse('incomecategory-detail', args=[category.id])

        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        updated_data = {'name': 'Commission'}
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class IncomeViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='password123', email='testuser@test.com'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
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
        self.url = reverse('income-list')

    def test_create_income(self):
        response = self.client.post(self.url, self.income_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Income.objects.count(), 1)
        income = Income.objects.get()
        self.assertEqual(income.amount, 3000.00)
        self.assertEqual(income.description, 'Monthly salary')
        self.assertEqual(income.owner, self.user)

    def test_list_incomes(self):
        Income.objects.create(owner=self.user, **{
            'date': '2023-01-15T12:00:00Z',
            'amount': 3000.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Monthly salary',
            'category': self.category,
        })
        response = self.client.get(self.url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_income(self):
        income = Income.objects.create(owner=self.user, **{
            'date': '2023-01-15T12:00:00Z',
            'amount': 3000.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Monthly salary',
            'category': self.category,
        })
        url = reverse('income-detail', args=[income.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['amount'], '3000.00')

    def test_update_income(self):
        income = Income.objects.create(owner=self.user, **{
            'date': '2023-01-15T12:00:00Z',
            'amount': 3000.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Monthly salary',
            'category': self.category,
        })
        url = reverse('income-detail', args=[income.id])
        updated_data = self.income_data.copy()
        updated_data['amount'] = '3200.00'
        updated_data['description'] = 'Monthly salary with bonus'
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        income.refresh_from_db()
        self.assertEqual(income.amount, 3200.00)
        self.assertEqual(income.description, 'Monthly salary with bonus')

    def test_delete_income(self):
        income = Income.objects.create(owner=self.user, **{
            'date': '2023-01-15T12:00:00Z',
            'amount': 3000.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Monthly salary',
            'category': self.category,
        })
        url = reverse('income-detail', args=[income.id])
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Income.objects.filter(id=income.id).exists())


class ExpenseViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='password123', email='testuser@test.com'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
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
        self.url = reverse('expense-list')

    def test_create_expense(self):
        response = self.client.post(self.url, self.expense_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Expense.objects.count(), 1)
        expense = Expense.objects.get()
        self.assertEqual(expense.amount, 50.00)
        self.assertEqual(expense.description, 'Grocery shopping')
        self.assertEqual(expense.owner, self.user)

    def test_list_expenses(self):
        Expense.objects.create(owner=self.user, **{
            'date': '2023-01-01T12:00:00Z',
            'amount': 50.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Grocery shopping',
            'category': self.category,
        })
        response = self.client.get(self.url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_expense(self):
        expense = Expense.objects.create(owner=self.user, **{
            'date': '2023-01-01T12:00:00Z',
            'amount': 50.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Grocery shopping',
            'category': self.category,
        })
        url = reverse('expense-detail', args=[expense.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['amount'], '50.00')

    def test_update_expense(self):
        expense = Expense.objects.create(owner=self.user, **{
            'date': '2023-01-01T12:00:00Z',
            'amount': 50.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Grocery shopping',
            'category': self.category,
        })
        url = reverse('expense-detail', args=[expense.id])
        updated_data = self.expense_data.copy()
        updated_data['amount'] = '75.00'
        updated_data['description'] = 'Supermarket shopping'
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expense.refresh_from_db()
        self.assertEqual(expense.amount, 75.00)
        self.assertEqual(expense.description, 'Supermarket shopping')

    def test_delete_expense(self):
        expense = Expense.objects.create(owner=self.user, **{
            'date': '2023-01-01T12:00:00Z',
            'amount': 50.00,
            'currency': self.currency,
            'account': self.account,
            'description': 'Grocery shopping',
            'category': self.category,
        })
        url = reverse('expense-detail', args=[expense.id])
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Expense.objects.filter(id=expense.id).exists())
