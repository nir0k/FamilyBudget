from django.db import models


class Currency(models.Model):
    """Currency model"""

    name = models.CharField(
        max_length=100,
        verbose_name="Currency",
        help_text="Input currency full name",
    )
    code = models.CharField(
        max_length=3,
        verbose_name="Code",
        help_text="Input currency code",
        default="XXX",
    )
    symbol = models.CharField(
        max_length=3,
        verbose_name="Symbol",
        help_text="Input currency symbol",
    )
    owner = models.ForeignKey(
        "users.User",
        related_name="currencies",
        on_delete=models.CASCADE,
        verbose_name="Owner",
        help_text="Select currency owner",
    )

    class Meta:
        verbose_name = "Currency"
        unique_together = ["name", "owner"]

    def __str__(self):
        return self.code


class AccountType(models.Model):
    """Account Type model"""

    name = models.CharField(
        max_length=100,
        verbose_name="Account Type",
        help_text="Input account type",
    )
    owner = models.ForeignKey(
        "users.User",
        related_name="account_types",
        on_delete=models.CASCADE,
        verbose_name="Owner",
        help_text="Select account type owner",
    )

    class Meta:
        verbose_name = "Account Type"
        unique_together = ["name", "owner"]

    def __str__(self):
        return self.name


class Bank(models.Model):
    """Bank model"""

    name = models.CharField(
        max_length=100,
        verbose_name="Bank",
        help_text="Input bank name",
    )
    country = models.CharField(
        max_length=100,
        verbose_name="Country",
        help_text="Input bank country",
    )
    owner = models.ForeignKey(
        "users.User",
        related_name="banks",
        on_delete=models.CASCADE,
        verbose_name="Owner",
        help_text="Select bank owner",
    )

    class Meta:
        verbose_name = "Bank"
        unique_together = ["name", "owner"]

    def __str__(self):
        return self.name


class Account(models.Model):
    """Account model"""

    name = models.CharField(
        max_length=100,
        verbose_name="Account",
        help_text="Input account name",
    )
    account_type = models.ForeignKey(
        AccountType,
        on_delete=models.CASCADE,
        verbose_name="Account Type",
        help_text="Select account type",
    )
    bank = models.ForeignKey(
        Bank,
        on_delete=models.CASCADE,
        verbose_name="Bank",
        help_text="Select bank",
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.CASCADE,
        verbose_name="Currency",
        help_text="Select currency",
    )
    balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Balance",
        help_text="Input account balance",
    )
    owner = models.ForeignKey(
        "users.User",
        related_name="accounts",
        on_delete=models.CASCADE,
        verbose_name="Owner",
        help_text="Select account owner",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Account"
        unique_together = ["name", "owner"]

    def __str__(self):
        return self.name
