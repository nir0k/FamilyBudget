from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from .models import User
from finances.models import Cash, BankCard, BankAccount
from .forms import CustomUserCreationForm, CustomUserChangeForm


class CashInline(admin.TabularInline):
    model = Cash
    extra = 0


class BankCardInline(admin.TabularInline):
    model = BankCard
    extra = 0


class BankAccountInline(admin.TabularInline):
    model = BankAccount
    extra = 0


class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ('username', 'email', 'is_admin', 'is_active', 'telegram_id')
    list_filter = ('is_admin', 'is_active')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('telegram_id',)}),
        ('Permissions', {'fields': ('is_admin', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2', 'is_admin', 'is_active')
        }),
    )
    search_fields = ('username', 'email', 'telegram_id')
    ordering = ('username',)
    filter_horizontal = ()
    inlines = [CashInline, BankCardInline, BankAccountInline]


admin.site.register(User, UserAdmin)
admin.site.unregister(Group)
