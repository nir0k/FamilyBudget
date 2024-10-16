from django.db import models
from finances.models import Currency, Account


def get_default_currency():
    ''' Get the default currency '''
    return Account.objects.first().currency if Account.objects.exists() else 1


class Expense_Category(models.Model):
    ''' Expense Category model '''
    name = models.CharField(
        max_length=255,
        unique=True,
        verbose_name="Category",
        help_text="Category name"
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Description",
        help_text="Category description"
    )
    owner = models.ForeignKey(
        "users.User",
        related_name="expense_categories",
        on_delete=models.CASCADE,
        verbose_name="Owner",
        help_text="Category owner"
    )

    class Meta:
        ordering = ["name"]
        verbose_name = "Expense Category"

    def __str__(self):
        return self.name


class Expense(models.Model):
    ''' Expense model '''
    category = models.ForeignKey(
        Expense_Category,
        related_name="expenses",
        on_delete=models.CASCADE,
        verbose_name="Category",
        help_text="Expense category"
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Amount",
        help_text="Expense amount"
    )
    account = models.ForeignKey(
        Account,
        related_name="expenses",
        on_delete=models.CASCADE,
        verbose_name="Account",
        help_text="Expense account"
    )
    currency = models.ForeignKey(
        Currency,
        related_name="expenses",
        on_delete=models.CASCADE,
        default=get_default_currency,
        verbose_name="Currency",
        help_text="Expense currency"
    )
    date = models.DateTimeField(
        verbose_name="Date",
        help_text="Expense date"
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Description",
        help_text="Expense description"
    )
    owner = models.ForeignKey(
        "users.User",
        related_name="expenses",
        on_delete=models.CASCADE,
        verbose_name="Owner",
        help_text="Expense owner"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date"]
        verbose_name = "Expense"

    def __str__(self):
        return self.description if self.description else "No description"
