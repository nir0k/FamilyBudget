from django.urls import include, path
from rest_framework import routers
from users.views import UserViewSet
from finances.views import (
    CurrencyViewSet,
    Account_TypeViewSet,
    BankViewSet,
    AccountViewSet
)


router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'currencies', CurrencyViewSet)
router.register(r'account_types', Account_TypeViewSet)
router.register(r'banks', BankViewSet)
router.register(r'accounts', AccountViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
