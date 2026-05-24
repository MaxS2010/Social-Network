from django.shortcuts import render
from django.views.generic import TemplateView , FormView
from .forms import MessageForm
from django.contrib.auth.mixins import LoginRequiredMixin
# Create your views here.

class ChatView(
        # FormView, 
        LoginRequiredMixin,
        TemplateView,
    ):
    
    template_name = "chat_app/chat.html"
    # form_class = MessageForm
    extra_context = {
        "form": MessageForm()
    }
    

class ContactsListView(LoginRequiredMixin, TemplateView):
    template_name = "chat_app/chat_list.html"