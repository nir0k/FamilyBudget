# Generated by Django 5.1.2 on 2024-10-17 05:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("finances", "0002_initial"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="account",
            options={"verbose_name": "Account"},
        ),
        migrations.AlterModelOptions(
            name="account_type",
            options={"verbose_name": "Account Type"},
        ),
        migrations.AlterModelOptions(
            name="bank",
            options={"verbose_name": "Bank"},
        ),
        migrations.AlterModelOptions(
            name="currency",
            options={"verbose_name": "Currency"},
        ),
    ]
