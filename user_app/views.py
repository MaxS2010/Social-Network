from typing import Any
from django.shortcuts import render
from django.views.generic.base import TemplateView
from django.views import View
from django.http import JsonResponse

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
    
class RegisterView(View):
    def post(self, request, *args, **kwargs):
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            # form.save()
            return JsonResponse({
                'success': True, 
                'message': 'Реєстрація успішна'
            })
        else:
            return JsonResponse({
                'success': False, 
                'errors': form.errors.get_json_data(),
            }, status= 400)


class LoginView(View):
    def post(self, request, *args, **kwargs):
        form = UserLoginForm(request.POST)
        if form.is_valid():
            return JsonResponse({
                'success': True, 
                'message': 'Вхід успішний'
            })
        else:
            return JsonResponse({
                'success': False, 
                'errors': form.errors.get_json_data(),
            }, status= 400)


class ConfirmView(View):
    def post(self, request, *args, **kwargs):

        session_code = request.session.get("confirm_code")

        if not session_code:
            return JsonResponse({
                "success": False,
                "message": "Код підтвердження не знайдено"
            }, status=400)

        form = UserConfirmForm(request.POST, confirm_code=session_code)

        if not form.is_valid():
            return JsonResponse({
                "success": False,
                "errors": form.errors.get_json_data(),
            }, status=400)

        register_data = request.session.get("register_data")

        if not register_data:
            return JsonResponse({
                "success": False,
                "message": "Дані реєстрації відсутні"
            }, status=400)

        user_form = UserRegisterForm(register_data)

        if user_form.is_valid():
            user = user_form.save()

            request.session.pop("confirm_code", None)
            request.session.pop("register_data", None)

            return JsonResponse({
                "success": True,
                "message": "Реєстрацію підтверджено"
            })

        return JsonResponse({
            "success": False,
            "errors": user_form.errors.get_json_data(),
        }, status=400)


class SettingsView(TemplateView):
    template_name = 'user_app/settings.html'

class LogoutView(View):
    def post(self, request, *args, **kwargs):
        # logout(request)
        return JsonResponse({
            'success': True, 
            'message': 'Вихід успішний'
        })
