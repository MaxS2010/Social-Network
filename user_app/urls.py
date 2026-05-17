from django.urls import path

from .views import AuthView, RegisterView, LoginView, LogoutView, SettingsView, ConfirmView, ExpandInfoView, FriendsView, FriendsSectionView


urlpatterns = [    
    path(route = '', view = AuthView.as_view(), name='auth'),
    path(route= 'register/', view= RegisterView.as_view(), name='register'),
    path(route = 'login/', view = LoginView.as_view(), name='login'),
    path(route = 'confirm/', view = ConfirmView.as_view(), name='confirm_email'),
    path(route = 'logout/', view = LogoutView.as_view(), name='logout'),
    path(route = 'expand-info/', view = ExpandInfoView.as_view(), name='expand_info'),
    path(route = 'settings/', view = SettingsView.as_view(), name='settings'),
    path(route= 'friends/', view= FriendsView.as_view(), name='friends'),
    path(route= 'friends/section/<str:section>/', view= FriendsSectionView.as_view(), name='friends_section'),
]