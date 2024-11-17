# budgets/tests/test_views.py

from budgets.models import Budget, BudgetCategory
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from transactions.models import ExpenseCategory

User = get_user_model()


class BudgetViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='password',
            email="testuser@email.com"
        )
        self.client.force_authenticate(user=self.user)
        self.expense_category = ExpenseCategory.objects.create(
            name='Entertainment', owner=self.user)
        self.budget = Budget.objects.create(
            owner=self.user,
            name='January Budget',
            total_amount=4000.00,
            start_date='2024-01-01',
            end_date='2024-01-31'
        )
        self.budget_category = BudgetCategory.objects.create(
            budget=self.budget,
            category=self.expense_category,
            amount=1500.00
        )

    def test_budget_list(self):
        url = reverse('budget-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_budget_retrieve(self):
        url = reverse('budget-detail', args=[self.budget.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'January Budget')

    def test_budget_create(self):
        url = reverse('budget-list')
        data = {
            'name': 'February Budget',
            'total_amount': '3500.00',
            'start_date': '2024-02-01',
            'end_date': '2024-02-28',
            'budget_categories': [
                {
                    'category': self.expense_category.id,
                    'amount': '1200.00'
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Budget.objects.filter(owner=self.user).count(), 2)

    def test_budget_update(self):
        url = reverse('budget-detail', args=[self.budget.id])
        data = {
            'name': 'Updated January Budget',
            'total_amount': '4500.00',
            'start_date': '2024-01-01',
            'end_date': '2024-01-31',
            'budget_categories': [
                {
                    'id': self.budget_category.id,
                    'category': self.expense_category.id,
                    'amount': '1600.00'
                }
            ]
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.budget.refresh_from_db()
        self.assertEqual(self.budget.name, 'Updated January Budget')
        self.assertEqual(float(self.budget.total_amount), 4500.00)
        self.assertEqual(self.budget.budget_categories.count(), 1)
        updated_category = self.budget.budget_categories.first()
        self.assertEqual(float(updated_category.amount), 1600.00)

    def test_budget_delete(self):
        url = reverse('budget-detail', args=[self.budget.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Budget.objects.filter(id=self.budget.id).exists())

    def test_budget_overlap(self):
        url = reverse('budget-list')
        data = {
            'name': 'Overlap Budget',
            'total_amount': '3000.00',
            'start_date': '2024-01-15',
            'end_date': '2024-02-15',
            'budget_categories': []
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'You already have budgets that overlap with the specified period',
            str(response.data)
        )

    def test_budget_permission(self):
        other_user = User.objects.create_user(
            username='otheruser',
            password='password',
            email='otheruser@example.com',
        )
        other_budget = Budget.objects.create(
            owner=other_user,
            name='Other Budget',
            total_amount=5000.00,
            start_date='2024-01-01',
            end_date='2024-01-31'
        )
        url = reverse('budget-detail', args=[other_budget.id])

        # Попытка получить чужой бюджет
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Попытка обновить чужой бюджет
        data = {
            'name': 'Hacked Budget',
            'total_amount': '6000.00',
            'start_date': '2024-01-01',
            'end_date': '2024-01-31',
            'budget_categories': []
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Попытка удалить чужой бюджет
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
