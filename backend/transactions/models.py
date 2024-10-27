from django.db import models
from finances.models import Account, Currency


def get_default_currency():
    """Get the default currency"""
    return Account.objects.first().currency if Account.objects.exists() else 1


class BaseCategory(models.Model):
    """Abstract base model for categories"""

    name = models.CharField(
        max_length=255, unique=True, verbose_name="Category", help_text="Category name"
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Description",
        help_text="Category description",
    )
    owner = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        verbose_name="Owner",
        help_text="Category owner",
    )

    class Meta:
        abstract = True
        ordering = ["name"]

    def __str__(self):
        return self.name


class Expense_Category(BaseCategory):
    """Expense Category model"""

    class Meta(BaseCategory.Meta):
        verbose_name = "Expense Category"


class Income_Category(BaseCategory):
    """Income Category model"""

    class Meta(BaseCategory.Meta):
        verbose_name = "Income Category"


class BaseTransaction(models.Model):
    """Abstract base model for transactions"""

    category = models.ForeignKey(
        BaseCategory,
        on_delete=models.CASCADE,
        verbose_name="Category",
        help_text="Transaction category",
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Amount",
        help_text="Transaction amount",
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        verbose_name="Account",
        help_text="Transaction account",
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.CASCADE,
        default=get_default_currency,
        verbose_name="Currency",
        help_text="Transaction currency",
    )
    date = models.DateTimeField(verbose_name="Date", help_text="Transaction date")
    description = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Description",
        help_text="Transaction description",
    )
    owner = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        verbose_name="Owner",
        help_text="Transaction owner",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-date"]

    def __str__(self):
        return self.description if self.description else "No description"


class Expense(BaseTransaction):
    """Expense model"""

    category = models.ForeignKey(
        Expense_Category,
        related_name="expenses",
        on_delete=models.CASCADE,
        verbose_name="Category",
        help_text="Expense category",
    )

    class Meta(BaseTransaction.Meta):
        verbose_name = "Expense"


class Income(BaseTransaction):
    """Income model"""

    category = models.ForeignKey(
        Income_Category,
        related_name="incomes",
        on_delete=models.CASCADE,
        verbose_name="Category",
        help_text="Income category",
    )

    class Meta(BaseTransaction.Meta):
        verbose_name = "Income"
