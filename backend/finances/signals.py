from decimal import Decimal

from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver
from finances.models import AccountBalanceHistory
from transactions.models import Expense, Income

# Global variable to store the original value of amount
previous_amount = {}


@receiver(pre_save, sender=Expense)
@receiver(pre_save, sender=Income)
def set_previous_amount(sender, instance, **kwargs):
    if instance.pk:  # If the transaction exists (i.e., it's not a creation)
        previous_amount[instance.pk] = Decimal(
            sender.objects.get(pk=instance.pk).amount)


@receiver(post_save, sender=Expense)
@receiver(post_save, sender=Income)
def update_account_balance_on_save(sender, instance, created, **kwargs):
    account = instance.account
    amount = Decimal(instance.amount)  # Ensure amount is a Decimal
    if created:
        if isinstance(instance, Expense):
            account.balance = Decimal(account.balance) - amount
        elif isinstance(instance, Income):
            account.balance = Decimal(account.balance) + amount
    else:
        # Use the saved value before the change
        old_amount = previous_amount.get(instance.pk, Decimal("0.00"))
        old_amount = Decimal(old_amount)
        if isinstance(instance, Expense):
            account.balance += old_amount - amount
        elif isinstance(instance, Income):
            account.balance -= old_amount - amount
        previous_amount.pop(instance.pk, None)
    account.save()


@receiver(post_delete, sender=Expense)
@receiver(post_delete, sender=Income)
def update_account_balance_on_delete(sender, instance, **kwargs):
    account = instance.account
    amount = Decimal(instance.amount)  # Ensure amount is a Decimal
    if isinstance(instance, Expense):
        account.balance = Decimal(account.balance) + amount
    elif isinstance(instance, Income):
        account.balance = Decimal(account.balance) - amount

    account.save()


def update_future_balances(account, start_date):
    future_entries = AccountBalanceHistory.objects.filter(
        account=account, date__gt=start_date).order_by('date')

    # Check for the existence of an entry for start_date
    previous_entry = AccountBalanceHistory.objects.filter(
        account=account, date=start_date).first()

    if not previous_entry:
        previous_balance = account.balance
    else:
        previous_balance = previous_entry.balance

    for entry in future_entries:
        entry.balance = previous_balance
        entry.save()
        previous_balance = entry.balance


@receiver(post_save, sender=Expense)
@receiver(post_save, sender=Income)
def log_balance_history(sender, instance, **kwargs):
    account = instance.account
    AccountBalanceHistory.objects.update_or_create(
        account=account,
        date=instance.date.date(),
        defaults={'balance': account.balance}
    )
