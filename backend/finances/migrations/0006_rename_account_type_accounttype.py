# Generated by Django 5.1.2 on 2024-10-28 17:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("finances", "0005_alter_account_name_alter_account_unique_together"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="Account_Type",
            new_name="AccountType",
        ),
    ]