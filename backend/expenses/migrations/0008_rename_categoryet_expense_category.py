# Generated by Django 5.1.2 on 2024-10-16 19:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("expenses", "0007_rename_category_expense_categoryet"),
    ]

    operations = [
        migrations.RenameField(
            model_name="expense",
            old_name="categoryet",
            new_name="category",
        ),
    ]
