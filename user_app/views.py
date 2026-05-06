from time import time
from typing import Any
from django.contrib.auth import authenticate, login, logout
from django.views.generic.base import TemplateView
from django.views import View
from django.http import HttpRequest, JsonResponse
from django.shortcuts import redirect


from .models import User

from .services import confirm_user
from .forms import UserExpandInfoForm, UserRegisterForm, UserLoginForm, UserConfirmForm
from .utils import generate_confirm_code, send_confirm_code

# Create your views here.


class AuthView(TemplateView):
    template_name = 'user_app/auth.html'
    def get_context_data(self, **kwargs) -> dict[str, Any]:
        context = super().get_context_data(**kwargs)
        if not self.request.user.is_authenticated:
            context["form_register"] = UserRegisterForm()
            context['form_login'] = UserLoginForm()
            context['form_confirm_email'] = UserConfirmForm()  
            context['form_info'] = UserExpandInfoForm()
        return context
    

class RegisterView(View):
    def post(self, request: HttpRequest):
        form = UserRegisterForm(request.POST)

        if not form.is_valid():
            return JsonResponse({
                "success": False,
                "errors": form.errors.get_json_data()
            }, status=400)

        confirm_code = generate_confirm_code()

        request.session["pending_user"] = {
            "email": form.cleaned_data["email"],
            "password1": form.cleaned_data["password1"],
            "password2": form.cleaned_data["password2"],
        }
        request.session["confirm_code"] = confirm_code

        request.session["confirm_code_created_at"] = time()

        send_confirm_code(code= confirm_code, email= form.cleaned_data["email"])
        

        return JsonResponse({
            "success": True,
            "message": "Код отправлен"
        })


class LoginView(View):
    def post(self, request: HttpRequest, *args, **kwargs):
        form = UserLoginForm(request, data=request.POST)

        if form.is_valid():
            user = form.get_user()
            login(request, user)

            return JsonResponse({
                'success': True,
                'is_profile_complete': user.is_profile_complete, # type: ignore
            })
        
        else:
            return JsonResponse({
                'success': False,
                'errors': form.errors.get_json_data(),
            })


class ConfirmView(View):
    def post(self, request: HttpRequest, *args, **kwargs):
        session_code = request.session.get("confirm_code")
        pending_user = request.session.get("pending_user")

        if not session_code or not pending_user:
            return JsonResponse({
                "success": False,
                "errors": "Сесія закінчилась або дані відсутні"
            }, status=400)

        form = UserConfirmForm(
            request.POST,
            confirm_code=session_code
        )

        if not form.is_valid():
            return JsonResponse({
                "success": False,
                "errors": form.errors.get_json_data()
            }, status=400)

        try:
            user = confirm_user(
                session=request.session,
                input_code=form.cleaned_data["code"]
            )

        except ValueError as error:
            return JsonResponse({
                "success": False,
                "errors": str(error)
            }, status=400)

        return JsonResponse({
            "success": True,
            "message": "Акаунт підтверджено"
        })


class ExpandInfoView(View):
    def post(self, request: HttpRequest, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({
                "success": False,
                "message": "Не авторизований"
            }, status=401)

        form = UserExpandInfoForm(
            request.POST,
            instance=request.user # type: ignore
        )

        if form.is_valid():
            user = form.save(commit=False)
            user.is_profile_complete = True
            user.save()

            return JsonResponse({
                "success": True,
                "message": "Дані оновлено"
            })

        return JsonResponse({
            "success": False,
            "errors": form.errors.get_json_data()
        }, status=400)
    
class LogoutView(View):
    def get(self, request: HttpRequest, *args, **kwargs):
        if request.user.is_authenticated:
            logout(request)
            return redirect('auth')
        else:
            return redirect(request.META.get('HTTP_REFERER', 'home'))

class SettingsView(TemplateView):
    template_name = 'user_app/settings.html'