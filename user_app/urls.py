from django.urls import path

from .views import AuthView, SettingsView

urlpatterns = [    
    path(route = 'auth/', view = AuthView.as_view(), name='auth'),
    path(route = 'settings/', view = SettingsView.as_view(), name='settings'),
]