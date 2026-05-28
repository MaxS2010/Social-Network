from django.urls import path
from .views import ChatView, ContactsPaginationView, ChatWithView

urlpatterns = [
    path(route= '', view= ChatView.as_view(), name= 'chat'),
    path(route= "contacts/", view= ContactsPaginationView.as_view(), name="contacts-pagination"),
    path(route= "chat_with/<int:user_id>/", view= ChatWithView.as_view(), name="chat_with"),
]   