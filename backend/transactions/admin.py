from django.contrib import admin

from .models import Expense, ExpenseCategory, Income, IncomeCategory


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "description", "owner"]
    search_fields = ["name", "description", "owner"]
    ordering = ["name", "owner"]
    list_per_page = 10


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = [
        "amount",
        "account",
        "currency",
        "date",
        "description",
        "category",
        "owner",
        "created_at",
        "updated_at",
    ]
    list_filter = ["account", "currency", "category", "owner"]
    search_fields = [
        "amount",
        "account",
        "currency",
        "date",
        "description",
        "category",
        "owner",
    ]
    ordering = ["-date", "amount", "account", "currency", "category", "owner"]
    list_per_page = 10


@admin.register(IncomeCategory)
class IncomeCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "description", "owner"]
    search_fields = ["name", "description", "owner"]
    ordering = ["name", "owner"]
    list_per_page = 10


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = [
        "amount",
        "account",
        "currency",
        "date",
        "description",
        "category",
        "owner",
        "created_at",
        "updated_at",
    ]
    list_filter = ["account", "currency", "category", "owner"]
    search_fields = [
        "amount",
        "account",
        "currency",
        "date",
        "description",
        "category",
        "owner",
    ]
    ordering = ["-date", "amount", "account", "currency", "category", "owner"]
    list_per_page = 10
