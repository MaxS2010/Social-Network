from django.urls import path

from .views import UserView

urlpatterns = [    
    path(route = '', view = UserView.as_view(), name='user'),
]