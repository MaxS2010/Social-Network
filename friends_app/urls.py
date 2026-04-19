from django.urls import path

from .views import FriendView

urlpatterns = [
    path(route= '', view= FriendView.as_view(), name='friends'),
]