from typing import Any

from django import forms
from django.contrib.auth import get_user_model, authenticate
User = get_user_model()

class UserRegisterForm(forms.ModelForm):
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
        fields = ('email',)
        labels = {
            'email': 'Електронна пошта'
        }
        widgets = {
            'email': forms.EmailInput(attrs={
                'placeholder': 'you@example.com',
                'class': "email-input",
            })
        }

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError('Користувач з такою електронною поштою вже існує')
        return email
    
    def clean(self) -> dict[str, Any]:
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            self.add_error('password2', 'Паролі не співпадають')
        cleaned_data = super().clean()
        return cleaned_data
    
    def save(self, commit: bool = True) -> Any:
        user = super().save(commit= False)
        user.username = ''
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user


class UserLoginForm(forms.ModelForm):
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

    class Meta:
        model = User
        fields = ('email',)
        labels = {
            'email': 'Електронна пошта'
        }
        widgets = {
            'email': forms.EmailInput(attrs={
                'placeholder': 'you@example.com',
                'class': "email-input",
            })
        }
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not User.objects.filter(email=email).exists():
            raise forms.ValidationError('Користувача з такою електронною поштою не знайдено')
        return email
    
    def clean(self):
        cleaned_data = super().clean()

        email = cleaned_data.get('email')
        password = cleaned_data.get('password1')

        if email and password:
            user = authenticate(username=email, password=password)

            if user is None:
                raise forms.ValidationError('Невірний email або пароль')

            self.user = user 

        return cleaned_data


class UserConfirmForm(forms.Form):

    def __init__(self, *args, confirm_code=None, **kwargs):
        super().__init__(*args, **kwargs)

        self.confirm_code = confirm_code

        for i in range(1, 7):
            self.fields[f'code{i}'] = forms.CharField(
                max_length= 1,
                required= True,
                label= '',
                widget=forms.TextInput(
                    attrs={
                        "class": "code-input",
                        "placeholder": "___",
                        "maxlength": 1,
                        "inputmode": "numeric"
                    }
                )
            )

    def clean(self) -> dict[str, Any]:
        cleaned_data = super().clean()

        code_digits = []

        for i in range(1, 7):
            digit = cleaned_data.get(f'code{i}')

            if not digit:
                self.add_error(f'code{i}', 'Введіть цифру')
            else:
                code_digits.append(digit)

        full_code = ''.join(code_digits)

        if self.confirm_code and full_code != self.confirm_code:
            raise forms.ValidationError('Невірний код підтвердження')

        cleaned_data['code'] = full_code

        return cleaned_data
        

