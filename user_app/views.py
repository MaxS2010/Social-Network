from typing import Any
from django.contrib.auth import authenticate, login
from django.views.generic.base import TemplateView
from django.views import View
from django.http import HttpRequest, JsonResponse

from .services import confirm_user

from .models import User

from .forms import UserExpandInfoForm, UserRegisterForm, UserLoginForm, UserConfirmForm
from .utils import generate_confirm_code, send_confirm_code

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
            user = form.save(commit=False)
            user.is_active = False
            user.save()

            code = generate_confirm_code()
            request.session['confirm_code'] = code
            request.session['confirm_user_id'] = user.id
            send_confirm_code(email=user.email, code=code)

            return JsonResponse({
                "success": True,
                "message": "Код відправлено"
            })

        return JsonResponse({
            'success': False, 
            'errors': form.errors.get_json_data(),
        }, status= 400)


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
    def post(self, request, *args, **kwargs):
        form = UserConfirmForm(
            request.POST,
            confirm_code=request.session.get("confirm_code")
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
    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({
                "success": False,
                "message": "Не авторизований"
            }, status=401)

        form = UserExpandInfoForm(request.POST, instance=request.user)

        if form.is_valid():
            form.save()

            return JsonResponse({
                "success": True,
                "message": "Дані оновлено"
            })

        return JsonResponse({
            "success": False,
            "errors": form.errors.get_json_data()
        }, status=400)


class SettingsView(TemplateView):
    template_name = 'user_app/settings.html'