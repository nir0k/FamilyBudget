# Generated by Django 5.1.2 on 2024-10-17 05:24

import django.db.models.deletion
import transactions.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("finances", "0003_alter_account_options_alter_account_type_options_and_more"),
        ("transactions", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name="expense",
            name="account",
            field=models.ForeignKey(
                help_text="Transaction account",
                on_delete=django.db.models.deletion.CASCADE,
                to="finances.account",
                verbose_name="Account",
            ),
        ),
        migrations.AlterField(
            model_name="expense",
            name="amount",
            field=models.DecimalField(
                decimal_places=2,
                help_text="Transaction amount",
                max_digits=10,
                verbose_name="Amount",
            ),
        ),
        migrations.AlterField(
            model_name="expense",
            name="currency",
            field=models.ForeignKey(
                default=transactions.models.get_default_currency,
                help_text="Transaction currency",
                on_delete=django.db.models.deletion.CASCADE,
                to="finances.currency",
                verbose_name="Currency",
            ),
        ),
        migrations.AlterField(
            model_name="expense",
            name="date",
            field=models.DateTimeField(
                help_text="Transaction date", verbose_name="Date"
            ),
        ),
        migrations.AlterField(
            model_name="expense",
            name="description",
            field=models.CharField(
                blank=True,
                help_text="Transaction description",
                max_length=255,
                null=True,
                verbose_name="Description",
            ),
        ),
        migrations.AlterField(
            model_name="expense",
            name="owner",
            field=models.ForeignKey(
                help_text="Transaction owner",
                on_delete=django.db.models.deletion.CASCADE,
                to=settings.AUTH_USER_MODEL,
                verbose_name="Owner",
            ),
        ),
        migrations.AlterField(
            model_name="expense_category",
            name="owner",
            field=models.ForeignKey(
                help_text="Category owner",
                on_delete=django.db.models.deletion.CASCADE,
                to=settings.AUTH_USER_MODEL,
                verbose_name="Owner",
            ),
        ),
        migrations.CreateModel(
            name="Income_Category",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        help_text="Category name",
                        max_length=255,
                        unique=True,
                        verbose_name="Category",
                    ),
                ),
                (
                    "description",
                    models.CharField(
                        blank=True,
                        help_text="Category description",
                        max_length=255,
                        null=True,
                        verbose_name="Description",
                    ),
                ),
                (
                    "owner",
                    models.ForeignKey(
                        help_text="Category owner",
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Owner",
                    ),
                ),
            ],
            options={
                "verbose_name": "Income Category",
                "ordering": ["name"],
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="Income",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "amount",
                    models.DecimalField(
                        decimal_places=2,
                        help_text="Transaction amount",
                        max_digits=10,
                        verbose_name="Amount",
                    ),
                ),
                (
                    "date",
                    models.DateTimeField(
                        help_text="Transaction date", verbose_name="Date"
                    ),
                ),
                (
                    "description",
                    models.CharField(
                        blank=True,
                        help_text="Transaction description",
                        max_length=255,
                        null=True,
                        verbose_name="Description",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "account",
                    models.ForeignKey(
                        help_text="Transaction account",
                        on_delete=django.db.models.deletion.CASCADE,
                        to="finances.account",
                        verbose_name="Account",
                    ),
                ),
                (
                    "currency",
                    models.ForeignKey(
                        default=transactions.models.get_default_currency,
                        help_text="Transaction currency",
                        on_delete=django.db.models.deletion.CASCADE,
                        to="finances.currency",
                        verbose_name="Currency",
                    ),
                ),
                (
                    "owner",
                    models.ForeignKey(
                        help_text="Transaction owner",
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Owner",
                    ),
                ),
                (
                    "category",
                    models.ForeignKey(
                        help_text="Income category",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="incomes",
                        to="transactions.income_category",
                        verbose_name="Category",
                    ),
                ),
            ],
            options={
                "verbose_name": "Income",
                "ordering": ["-date"],
                "abstract": False,
            },
        ),
    ]
