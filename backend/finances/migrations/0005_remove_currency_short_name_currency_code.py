# Generated by Django 5.1.2 on 2024-10-13 10:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("finances", "0004_currency_bankaccount_currency_bankcard_currency_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="currency",
            name="short_name",
        ),
        migrations.AddField(
            model_name="currency",
            name="code",
            field=models.CharField(
                default="XXX",
                help_text="Input currency code",
                max_length=3,
                verbose_name="Code",
            ),
        ),
    ]
