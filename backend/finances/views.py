# finances/views.py

from rest_framework import viewsets
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from .models import Account, AccountBalanceHistory, AccountType, Bank, Currency
from .serializers import (
    AccountSerializer,
    AccountTypeSerializer,
    BankSerializer,
    CurrencySerializer,
    AccountBalanceHistorySerializer,
)


class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Currency.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user:
            raise PermissionDenied("You do not have permission to edit this currency.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            raise PermissionDenied(
                "You do not have permission to delete this currency.")
        instance.delete()


class AccountTypeViewSet(viewsets.ModelViewSet):
    queryset = AccountType.objects.all()
    serializer_class = AccountTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return AccountType.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user:
            raise PermissionDenied(
                "You do not have permission to edit this account type.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            raise PermissionDenied(
                "You do not have permission to delete this account type.")
        instance.delete()


class BankViewSet(viewsets.ModelViewSet):
    queryset = Bank.objects.all()
    serializer_class = BankSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Bank.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user:
            raise PermissionDenied("You do not have permission to edit this bank.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            raise PermissionDenied("You do not have permission to delete this bank.")
        instance.delete()


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Account.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user:
            raise PermissionDenied("You do not have permission to edit this account.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            raise PermissionDenied("You do not have permission to delete this account.")
        instance.delete()


# class AccountBalanceHistoryView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, account_id):
#         history = AccountBalanceHistory.objects.filter(
#             account__id=account_id, account__owner=request.user)
#         response_data = [
#             {
#                 'date': entry.date,
#                 'balance': entry.balance
#             }
#             for entry in history
#         ]
#         return Response(response_data)
class AccountBalanceHistoryView(ListAPIView):
    serializer_class = AccountBalanceHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        account_id = self.kwargs.get("account_id")
        return AccountBalanceHistory.objects.filter(
            account__id=account_id, account__owner=self.request.user
        )
