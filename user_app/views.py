from typing import Any
from django.shortcuts import render
from django.views.generic.base import TemplateView

from .forms import UserRegisterForm, UserLoginForm, UserConfirmForm

# Create your views here.


class AuthView(TemplateView):
    template_name = 'user_app/auth.html'
    def get_context_data(self, **kwargs) -> dict[str, Any]:
        context = super().get_context_data(**kwargs)
        context["form_register"] = UserRegisterForm()
        context['form_login'] = UserLoginForm()
        context['form_confirm_email'] = UserConfirmForm()  
        return context
    

class SettingsView(TemplateView):
    template_name = 'user_app/settings.html'
