from django.urls import path

from django.contrib.auth.views import LogoutView
from .views import AuthView, RegisterView, LoginView, SettingsView, ConfirmView

urlpatterns = [    
    path(route = 'auth/', view = AuthView.as_view(), name='auth'),
    path(route= 'register/', view= RegisterView.as_view(), name='register'),
    path(route = 'login/', view = LoginView.as_view(), name='login'),
    path(route = 'confirm/', view = ConfirmView.as_view(), name='confirm_email'),
    path(route = 'logout/', view = LogoutView.as_view(next_page='/user/auth/'), name='logout'),
    
    path(route = 'settings/', view = SettingsView.as_view(), name='settings'),
]