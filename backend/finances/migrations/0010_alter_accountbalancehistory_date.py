# Generated by Django 5.1.2 on 2024-11-10 13:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("finances", "0009_accountbalancehistory"),
    ]

    operations = [
        migrations.AlterField(
            model_name="accountbalancehistory",
            name="date",
            field=models.DateField(),
        ),
    ]
