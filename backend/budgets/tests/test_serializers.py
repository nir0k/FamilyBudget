# budgets/tests/test_serializers.py

from budgets.models import Budget
from budgets.serializers import BudgetSerializer
from django.contrib.auth import get_user_model
from django.test import TestCase
from finances.models import Account, AccountType, Bank, Currency
from transactions.models import ExpenseCategory

User = get_user_model()


class BudgetSerializerTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='password',
            email="testuser@email.com"
        )
        # Create necessary objects Currency, AccountType, Bank, Account
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
            name='Transport', owner=self.user)
        self.budget_data = {
            'name': 'December Budget',
            'total_amount': '3000.00',
            'start_date': '2023-12-01',
            'end_date': '2023-12-31',
            'budget_categories': [
                {
                    'category': self.expense_category.id,  # Pass the category ID
                    'amount': '1000.00'
                }
            ]
        }

    def test_budget_serializer_create(self):
        serializer = BudgetSerializer(
            data=self.budget_data, context={'request': self._get_request()}
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        budget = serializer.save()
        self.assertEqual(budget.name, 'December Budget')
        self.assertEqual(float(budget.total_amount), 3000.00)
        self.assertEqual(budget.owner, self.user)
        self.assertEqual(budget.budget_categories.count(), 1)
        budget_category = budget.budget_categories.first()
        self.assertEqual(float(budget_category.amount), 1000.00)
        self.assertEqual(budget_category.category, self.expense_category)

    def test_budget_serializer_validate_dates(self):
        invalid_data = self.budget_data.copy()
        invalid_data['start_date'] = '2023-12-31'
        invalid_data['end_date'] = '2023-12-01'
        serializer = BudgetSerializer(
            data=invalid_data, context={'request': self._get_request()}
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn(
            'Start date must be earlier than or equal to end date.',
            str(serializer.errors)
        )

    def test_budget_serializer_validate_overlap(self):
        # Create an existing budget for the same period
        Budget.objects.create(
            owner=self.user,
            name='Existing Budget',
            total_amount=2000.00,
            start_date='2023-12-01',
            end_date='2023-12-31'
        )
        serializer = BudgetSerializer(
            data=self.budget_data, context={'request': self._get_request()}
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn(
            'You already have budgets that overlap with the specified period',
            str(serializer.errors)
        )

    def _get_request(self):
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = self.user
        return request
