from finances.models import Account
from finances.serializers import AccountSerializer
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user model"""

    accounts = AccountSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "telegram_id",
            "password",
            "accounts",
            "locale",
        ]
        extra_kwargs = {
            "password": {
                "write_only": True,
                "required": False,
            },
        }

    def validate(self, data):
        if not self.instance and not data.get("password"):
            raise serializers.ValidationError({"password": "This field is required."})
        return data

    def create(self, validated_data):
        if "accounts" not in self.initial_data:
            user = User.objects.create_user(**validated_data)
            return user

        accounts = validated_data.pop("accounts")
        user = User.objects.create_user(**validated_data)
        for account in accounts:
            Account.objects.create(owner=user, **account)

        return user

    def update(self, instance, validated_data):
        """Update user and accounts"""
        if "accounts" in validated_data:
            accounts_data = validated_data.pop("accounts")
            existing_account_ids = [account.id for account in instance.accounts.all()]

            # Update or create accounts
            for account_data in accounts_data:
                account_id = account_data.get("id")
                if account_id and account_id in existing_account_ids:
                    account = Account.objects.get(id=account_id, owner=instance)
                    for attr, value in account_data.items():
                        setattr(account, attr, value)
                    account.save()
                    existing_account_ids.remove(account_id)
                else:
                    account_data.pop("owner", None)
                    Account.objects.create(owner=instance, **account_data)
            # Delete accounts that were not included in the request
            for account_id in existing_account_ids:
                Account.objects.get(id=account_id, owner=instance).delete()

        return super().update(instance, validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password"""

    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_current_password(self, value):
        user = self.context["user"]
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is not correct")
        return value

    def save(self, **kwargs):
        user = self.context["user"]
        new_password = self.validated_data["new_password"]
        user.set_password(new_password)
        user.save()
        return user
