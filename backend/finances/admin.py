from django.contrib import admin

from .models import Account, AccountType, Bank, Currency


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "account_type",
        "bank",
        "currency",
        "balance",
        "owner",
        "created_at",
        "updated_at",
    ]
    list_filter = ["account_type", "bank", "currency", "owner"]
    search_fields = ["name", "account_type", "bank", "currency"]
    ordering = ["owner", "name", "account_type", "bank", "currency"]
    list_per_page = 10


@admin.register(Bank)
class BankAdmin(admin.ModelAdmin):
    list_display = ["name", "country"]
    list_filter = ["country"]
    search_fields = ["name", "country"]
    ordering = ["country", "name"]
    list_per_page = 10


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "symbol"]
    search_fields = ["code", "name"]
    ordering = ["name", "code"]
    list_per_page = 10


@admin.register(AccountType)
class AccountTypeAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ["name"]
    ordering = ["name"]
    list_per_page = 10
