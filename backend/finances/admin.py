from django.contrib import admin
from .models import (
    Cash,
    Bank,
    BankCardType,
    BankCard,
    BankAccountType,
    BankAccount,
    Currency,
)


@admin.register(Cash)
class CashAdmin(admin.ModelAdmin):
    list_display = (
        "id", "user", "name", "balance", "currency", "created_at", "updated_at"
    )
    list_display_links = ("id", "name")
    search_fields = ("name", "user")
    list_filter = ("user",)
    list_per_page = 25


@admin.register(BankCardType)
class BankCardTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    list_display_links = ("id", "name")
    search_fields = ("name",)
    list_per_page = 25


@admin.register(Bank)
class BankAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    list_display_links = ("id", "name")
    search_fields = ("name",)
    list_per_page = 25


@admin.register(BankCard)
class BankCardAdmin(admin.ModelAdmin):
    list_display = (
        "id", "user", "bank", "type", "name", "balance",
        "currency", "created_at", "updated_at"
    )
    list_display_links = ("id", "name")
    search_fields = ("name", "type", "bank", "user")
    list_filter = ("user", "bank", "type")
    list_per_page = 25


@admin.register(BankAccountType)
class BankAccountTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    list_display_links = ("id", "name")
    search_fields = ("name",)
    list_per_page = 25


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = (
        "id", "user", "bank", "type", "name", "balance",
        "currency", "created_at", "updated_at"
    )
    list_display_links = ("id", "name")
    search_fields = ("name", "type", "bank", "user")
    list_filter = ("user", "bank", "type")
    list_per_page = 25


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "code", "symbol")
    list_display_links = ("id", "name")
    search_fields = ("name", "code", "symbol")
    list_per_page = 25
