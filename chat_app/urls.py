from django.urls import path
from .views import ChatView, ContactsPaginationView, ChatWithView, CreateGroupview, GroupHistoryView

urlpatterns = [
    path(route= '', view= ChatView.as_view(), name= 'chat'),
    path(route= "contacts/", view= ContactsPaginationView.as_view(), name= "contacts-pagination"),
    path(route= "chat_with/<int:user_id>/", view= ChatWithView.as_view(), name= "chat_with"),
    path(route= "create_group/", view= CreateGroupview.as_view(), name= "create_group"),
    path(route= "chat_history/<int:chat_id>/", view= GroupHistoryView.as_view(), name= "chat_history"),
    path("contacts-modal/", ContactsPaginationView.as_view(), name="contacts_modal")
]