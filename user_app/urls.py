from django.urls import path

from .views import AuthView, LogoutView, RegisterView, LoginView, SettingsView

urlpatterns = [    
    path(route = 'auth/', view = AuthView.as_view(), name='auth'),
    path(route= 'register/', view= RegisterView.as_view(), name='register'),
    path(route = 'login/', view = LoginView.as_view(), name='login'),
    path(route = 'logout/', view = LogoutView.as_view(), name='logout'),
    path(route = 'settings/', view = SettingsView.as_view(), name='settings'),
]