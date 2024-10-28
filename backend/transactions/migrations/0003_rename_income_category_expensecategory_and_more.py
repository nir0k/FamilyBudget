# Generated by Django 5.1.2 on 2024-10-28 17:36

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("transactions", "0002_alter_expense_account_alter_expense_amount_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameModel(
            old_name="Income_Category",
            new_name="ExpenseCategory",
        ),
        migrations.RenameModel(
            old_name="Expense_Category",
            new_name="IncomeCategory",
        ),
        migrations.AlterModelOptions(
            name="expensecategory",
            options={"ordering": ["name"], "verbose_name": "Expense Category"},
        ),
        migrations.AlterModelOptions(
            name="incomecategory",
            options={"ordering": ["name"], "verbose_name": "Income Category"},
        ),
    ]
