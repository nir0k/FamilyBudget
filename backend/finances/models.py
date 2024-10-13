from django.db import models


class Currency(models.Model):
    """ Currency model """
    name = models.CharField(
        max_length=100,
        verbose_name="Currency",
        help_text="Input currency full name",
    )
    code = models.CharField(
        max_length=3,
        verbose_name="Code",
        help_text="Input currency code",
        default="XXX"
    )
    symbol = models.CharField(
        max_length=3,
        verbose_name="Symbol",
        help_text="Input currency symbol",
    )

    def __str__(self):
        return self.code


class Cash(models.Model):
    """ Cash model """
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        verbose_name="User",
        help_text="Select user"
    )
    name = models.CharField(
        max_length=100,
        verbose_name="Cash name",
        help_text="Input cash name",
        default="Cash"
    )
    balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Balance",
        help_text="Input balance"
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        verbose_name="Currency",
        help_text="Select currency",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class BankCardType(models.Model):
    """ Bank Card Type model """
    name = models.CharField(
        max_length=100,
        verbose_name="Bank Card Type",
        help_text="Input bank card type",
    )

    def __str__(self):
        return self.name


class Bank(models.Model):
    """ Bank model """
    name = models.CharField(
        max_length=100,
        verbose_name="Bank name",
        help_text="Input bank name",
        default="Bank"
    )

    def __str__(self):
        return self.name


class BankCard(models.Model):
    """ Bank Card model """
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        verbose_name="User",
        help_text="Select user"
    )
    name = models.CharField(
        max_length=100,
        verbose_name="Bank Card name",
        help_text="Input bank card name",
        default="Bank Card"
    )
    bank = models.ForeignKey(
        Bank,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Bank",
        help_text="Select bank"
    )
    type = models.ForeignKey(
        BankCardType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Bank Card Type",
        help_text="Select bank card type"
    )
    balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Balance",
        help_text="Input balance"
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        verbose_name="Currency",
        help_text="Select currency",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class BankAccountType(models.Model):
    """ Bank Account Type model """
    name = models.CharField(
        max_length=100,
        verbose_name="Bank Account Type",
        help_text="Input bank account type",
    )

    def __str__(self):
        return self.name


class BankAccount(models.Model):
    """ Bank Account model """
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        verbose_name="User",
        help_text="Select user"
    )
    name = models.CharField(
        max_length=100,
        verbose_name="Bank Account name",
        help_text="Input bank account name",
        default="Bank Account"
    )
    bank = models.ForeignKey(
        Bank,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Bank",
        help_text="Select bank"
    )
    type = models.ForeignKey(
        BankAccountType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Bank Account Type",
        help_text="Select bank account type"
    )
    balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Balance",
        help_text="Input balance"
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        verbose_name="Currency",
        help_text="Select currency",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
