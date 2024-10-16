from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from .models import User
from .forms import CustomUserCreationForm, CustomUserChangeForm
from finances.models import Account


class AccountInline(admin.TabularInline):
    model = Account
    extra = 0
    verbose_name = 'Account'
    verbose_name_plural = 'Accounts'


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

    inlines = [AccountInline]


admin.site.register(User, UserAdmin)
admin.site.unregister(Group)
