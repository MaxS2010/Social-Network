from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import TemplateView , FormView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import Paginator
from django.template.loader import render_to_string
from django.contrib.auth import get_user_model

from .models import Chat, Message
from user_app.utils.friend_queries import get_users_by_section
from .forms import MessageForm
# Create your views here.

User = get_user_model()

class ChatView(
        # FormView, 
        LoginRequiredMixin,
        TemplateView,
    ):
    template_name = "chat_app/chat.html"
    
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        contacts = get_users_by_section(
            self.request.user,
            "friends"
        )

        paginator = Paginator(contacts, 12)

        context["contacts"] = paginator.get_page(1)

        context["form"] = MessageForm()
        context["personal_chats"] = Chat.objects.filter(users= self.request.user, is_group= False).order_by("id")

        return context
    

class ContactsPaginationView(LoginRequiredMixin, View):
    paginate_by = 12

    def get(self, request, *args, **kwargs):

        contacts = get_users_by_section(
            request.user,
            "friends"
        )

        paginator = Paginator(contacts, self.paginate_by)

        page_number = int(request.GET.get("page", 1))
        page_obj = paginator.get_page(page_number)

        if page_number > paginator.num_pages:
            return JsonResponse({
                "success": False
            })

        html = render_to_string(
            "chat_app/particles/chat_sections/contacts_list.html",
            {
                "contacts": page_obj.object_list
            },
            request= request
        )

        return JsonResponse(
            {
                "success": True,
                "html": html
            }
        )

class ChatWithView(LoginRequiredMixin, View):
    def post(self, request, user_id, *args, **kwargs):
        # user_id = request.POST.get("user_id")
        other_user = User.objects.get(id= user_id)
        friends = get_users_by_section(request.user, "friends")

        if other_user not in friends:
            return JsonResponse({
                "success": False,
                "error": "Користувач не є другом"
            }, status= 403)
        user_id_chats = Chat.objects.filter(users= request.user, is_group= False).values_list("id", flat= True)
        chat = Chat.objects.filter(
            id__in= user_id_chats,
            users= other_user,
            is_group= False
        ).first()

        if not chat:
            chat = Chat.objects.create(is_group=False)
            chat.users.add(request.user)
            chat.users.add(other_user)

        return JsonResponse(
            {
                "success": True,
                "chat_id": chat.id, # type: ignore
                "username": other_user.email
            }   
        )