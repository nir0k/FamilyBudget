from rest_framework import serializers
from transactions.models import ExpenseCategory
from .models import Budget, BudgetCategory


class BudgetCategorySerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=ExpenseCategory.objects.all()
    )
    spent = serializers.SerializerMethodField()

    class Meta:
        model = BudgetCategory
        fields = ['id', 'category', 'amount', 'spent']

    def get_spent(self, obj):
        return obj.budget.category_spent(obj.category)

    def validate_category(self, value):
        user = self.context['request'].user
        if value.owner != user:
            raise serializers.ValidationError(
                "Category does not belong to the current user."
            )
        return value

    def create(self, validated_data):
        budget = self.context.get('budget')
        return BudgetCategory.objects.create(budget=budget, **validated_data)


class BudgetSerializer(serializers.ModelSerializer):
    budget_categories = BudgetCategorySerializer(many=True, required=False)
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            'id',
            'name',
            'total_amount',
            'start_date',
            'end_date',
            'total_spent',
            'budget_categories'
        ]

    def validate(self, data):
        user = self.context['request'].user
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date > end_date:
            raise serializers.ValidationError(
                "Start date must be earlier than or equal to end date."
            )

        overlapping_budgets = Budget.objects.filter(
            owner=user,
            start_date__lte=end_date,
            end_date__gte=start_date
        )

        if self.instance:
            overlapping_budgets = overlapping_budgets.exclude(id=self.instance.id)

        if overlapping_budgets.exists():
            overlapping_budget_names = ', '.join(
                [budget.name for budget in overlapping_budgets]
            )
            raise serializers.ValidationError(
                f"You already have budgets that overlap with the specified period: "
                f"{overlapping_budget_names}."
            )

        return data

    def create(self, validated_data):
        budget_categories_data = validated_data.pop('budget_categories', [])
        budget = Budget.objects.create(
            **validated_data, owner=self.context['request'].user
        )

        for category_data in budget_categories_data:
            BudgetCategory.objects.create(budget=budget, **category_data)
        return budget

    def update(self, instance, validated_data):
        budget_categories_data = validated_data.pop('budget_categories', [])
        instance.name = validated_data.get('name', instance.name)
        instance.total_amount = validated_data.get(
            'total_amount', instance.total_amount)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        instance.save()

        # Handle updating budget_categories
        existing_ids = [
            item.get('id') for item in budget_categories_data if item.get('id')]
        # Remove categories that were not sent in the request
        BudgetCategory.objects.filter(
            budget=instance).exclude(id__in=existing_ids).delete()

        for category_data in budget_categories_data:
            category_id = category_data.get('id', None)
            if category_id:
                # Update existing category
                budget_category = BudgetCategory.objects.get(
                    id=category_id, budget=instance)
                budget_category.amount = category_data.get(
                    'amount', budget_category.amount)
                budget_category.category_id = category_data.get(
                    'category', budget_category.category_id)
                budget_category.save()
            else:
                # Create new category
                BudgetCategory.objects.create(budget=instance, **category_data)
        return instance

    def get_total_spent(self, obj):
        return obj.total_spent
