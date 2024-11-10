from django.urls import include, path
from finances.views import (
    AccountBalanceHistoryView,
    AccountTypeViewSet,
    AccountViewSet,
    BankViewSet,
    CurrencyViewSet,
)
from rest_framework import routers
from transactions.views import (
    ExpenseCategoryViewSet,
    ExpenseViewSet,
    IncomeCategoryViewSet,
    IncomeViewSet,
)
from users.views import UserViewSet, change_password

router = routers.DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"currencies", CurrencyViewSet)
router.register(r"accountTypes", AccountTypeViewSet)
router.register(r"banks", BankViewSet)
router.register(r"accounts", AccountViewSet)
router.register(r'incomeCategories', IncomeCategoryViewSet)
router.register(r'expenseCategories', ExpenseCategoryViewSet)
router.register(r'incomes', IncomeViewSet)
router.register(r'expenses', ExpenseViewSet)

urlpatterns = [
    path("v1/", include(router.urls)),
    path("v1/auth/", include("djoser.urls.authtoken")),
    path("v1/users/set_password", change_password, name="change-password"),
    path("v1/accounts/<int:account_id>/balance-history/",
         AccountBalanceHistoryView.as_view(), name="account-balance-history"),
]
