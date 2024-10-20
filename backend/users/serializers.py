from rest_framework import serializers
from .models import User
from finances.serializers import AccountSerializer
from finances.models import Account


class UserSerializer(serializers.ModelSerializer):
    accounts = AccountSerializer(many=True, required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'telegram_id',
            'password',
            'accounts',
        ]
        extra_kwargs = {
            'password': {
                'write_only': True,
                'required': True,
            },
        }

    def create(self, validated_data):
        if 'accounts' not in self.initial_data:
            user = User.objects.create_user(**validated_data)
            return user

        accounts = validated_data.pop('accounts')
        user = User.objects.create_user(**validated_data)
        for account in accounts:
            Account.objects.create(owner=user, **account)

        return user
