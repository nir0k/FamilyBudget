from decimal import Decimal

from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver
from transactions.models import Expense, Income

# Global variable to store the original value of amount
previous_amount = {}


@receiver(pre_save, sender=Expense)
@receiver(pre_save, sender=Income)
def set_previous_amount(sender, instance, **kwargs):
    if instance.pk:  # If the transaction exists (i.e., it's not a creation)
        previous_amount[instance.pk] = sender.objects.get(pk=instance.pk).amount


@receiver(post_save, sender=Expense)
@receiver(post_save, sender=Income)
def update_account_balance_on_save(sender, instance, created, **kwargs):
    account = instance.account
    if created:
        # For expenses, decrease the balance; for incomes, increase it
        if isinstance(instance, Expense):
            account.balance = Decimal(account.balance) - Decimal(instance.amount)
        elif isinstance(instance, Income):
            account.balance = Decimal(account.balance) + Decimal(instance.amount)
    else:
        # Use the saved value before the change
        old_amount = previous_amount.get(instance.pk, Decimal("0.00"))
        if isinstance(instance, Expense):
            account.balance = (
                Decimal(account.balance) + Decimal(old_amount) -
                Decimal(instance.amount)
            )
        elif isinstance(instance, Income):
            account.balance = (
                Decimal(account.balance) - Decimal(old_amount) +
                Decimal(instance.amount)
            )
        previous_amount.pop(instance.pk, None)  # Remove the value after use
    account.save()


@receiver(post_delete, sender=Expense)
@receiver(post_delete, sender=Income)
def update_account_balance_on_delete(sender, instance, **kwargs):
    account = instance.account
    if isinstance(instance, Expense):
        account.balance = Decimal(account.balance) + Decimal(instance.amount)
    else:
        account.balance = Decimal(account.balance) - Decimal(instance.amount)
    account.save()
