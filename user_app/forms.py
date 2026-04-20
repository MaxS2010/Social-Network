from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, UserChangeForm
from .models import User

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField(
        max_length= 100,
        label= 'Електронна пошта', 
        required= True,
        help_text= "",
        widget= forms.EmailInput(
            attrs={
                'placeholder': 'you@example.com',
                'class': "email-input",
            }
        )
    )

    password1 = forms.CharField(
        max_length= 100,
        label= 'Пароль', 
        required= True,
        widget= forms.PasswordInput(
            attrs={
                'placeholder': 'Введи пароль',
                'class': "password-input",
            }
        )
    )

    password2 = forms.CharField(
        max_length= 100,
        label= 'Підтверди пароль', 
        required= True,
        help_text= "",
        widget= forms.PasswordInput(
            attrs={
                'placeholder': 'Повтори пароль',
                'class': "password-input",
                'autocomplete': 'new-password',
            }
        )
    )
    class Meta:
        model = User
        fields = ('email', 'password1', 'password2')


class UserLoginForm(AuthenticationForm):
    username = forms.EmailField(
        label='Email',
        widget=forms.EmailInput(attrs={'autofocus': True})
    )

    class Meta:
        model = User
        fields = ('username', 'password')


class UserConfirmForm(UserChangeForm):
    password = None

    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name')