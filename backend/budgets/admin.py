# budgets/admin.py

from django.contrib import admin

from .models import Budget, BudgetCategory


class BudgetCategoryInline(admin.TabularInline):
    model = BudgetCategory
    extra = 1


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'total_amount', 'start_date', 'end_date')
    inlines = [BudgetCategoryInline]
