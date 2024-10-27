from django.urls import include, path
from finances.views import (
    Account_TypeViewSet,
    AccountViewSet,
    BankViewSet,
    CurrencyViewSet,
)
from rest_framework import routers
from users.views import UserViewSet, change_password

router = routers.DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"currencies", CurrencyViewSet)
router.register(r"account_types", Account_TypeViewSet)
router.register(r"banks", BankViewSet)
router.register(r"accounts", AccountViewSet)

urlpatterns = [
    path("v1/", include(router.urls)),
    path("v1/auth/", include("djoser.urls.authtoken")),
    path("v1/users/set_password", change_password, name="change-password"),
]
