from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import TemplateView , FormView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import Paginator
from django.template.loader import render_to_string
from django.contrib.auth import get_user_model
from django.db.models import CharField, DateTimeField, OuterRef, Subquery
from collections import defaultdict


from .models import Chat, Message
from user_app.utils.friend_queries import get_users_by_section
from user_app.utils.online_status import get_online_user_ids
from .forms import MessageForm
# Create your views here.

User = get_user_model()
    
class ChatView(LoginRequiredMixin, TemplateView):
    template_name = "chat_app/chat.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        contacts_qs = (
            get_users_by_section(self.request.user, "friends")
            .order_by("username")
        )

        paginator = Paginator(contacts_qs, 12)
        first_page = paginator.get_page(1)

        context["contacts"] = [
            {
                "id": contact.id,
                "username": contact.username,
                "avatar": (
                    contact.profile.avatar.url
                    if getattr(contact, "profile", None) and contact.profile.avatar
                    else None
                )
            }
            for contact in first_page.object_list
        ]

        context["contacts_has_next"] = first_page.has_next()

        context["form"] = MessageForm()

        last_message = Message.objects.filter(
            chat=OuterRef('pk')
        ).order_by('-created_at')

        personal_chats = Chat.objects.filter(
            users=self.request.user,
            is_group=False
        ).prefetch_related(
            'users__profile'
        ).annotate(
            last_message_text=Subquery(last_message.values('text')[:1], output_field=CharField()),
            last_message_time=Subquery(last_message.values('created_at')[:1], output_field=DateTimeField()),
        ).order_by('id')

        other_user_ids = set()
        for chat in personal_chats:
            for user in chat.users.all():
                if user.id != self.request.user.id:
                    other_user_ids.add(user.id)

        context["personal_chats"] = personal_chats
        context["online_user_ids"] = get_online_user_ids(other_user_ids)

        context["group_chats"] = Chat.objects.filter(
            users=self.request.user,
            is_group=True
        ).annotate(
            last_message_text=Subquery(last_message.values('text')[:1], output_field=CharField()),
            last_message_time=Subquery(last_message.values('created_at')[:1], output_field=DateTimeField()),
        ).order_by('id')

        return context
    
class ContactsPaginationView(LoginRequiredMixin, View):
    paginate_by = 12

    def get(self, request, *args, **kwargs):

        contacts = (
            get_users_by_section(request.user, "friends")
            .order_by("username")
        )

        paginator = Paginator(contacts, self.paginate_by)

        page_number = int(request.GET.get("page", 1))

        page_obj = paginator.get_page(page_number)

        if page_number > paginator.num_pages:
            return JsonResponse({
                "success": False,
                "results": [],
                "has_next": False
            })

        results = [
            {
                "id": contact.id,
                "username": contact.username,
                "avatar": (
                    contact.profile.avatar.url
                    if getattr(contact, "profile", None) and contact.profile.avatar
                    else None
                )
            }
            for contact in page_obj.object_list
        ]

        return JsonResponse({
            "success": True,
            "results": results,
            "has_next": page_obj.has_next(),
            "next_page": (
                page_obj.next_page_number()
                if page_obj.has_next()
                else None
            )
        })

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

        messages = [
            {
                "sender": message.sender.username,
                "text": message.text,
                "datetime": message.created_at.isoformat(),
            }
            for message in chat.messages.select_related('sender').order_by('created_at') # type: ignore
        ]

        return JsonResponse(
            {
                "success": True,
                "chat_id": chat.id, # type: ignore
                "username": other_user.username,
                "current_user": request.user.username,
                "messages": messages,
            }   
        )


class GroupHistoryView(LoginRequiredMixin, View):
    def get(self, request, chat_id, *args, **kwargs):
        try:
            chat = Chat.objects.get(id=chat_id, is_group=True)
        except Chat.DoesNotExist:
            return JsonResponse({"success": False, "error": "Chat not found"}, status=404)

        # ensure user is participant
        if request.user not in chat.users.all():
            return JsonResponse({"success": False, "error": "Not a member of this chat"}, status=403)

        messages = [
            {
                "sender": message.sender.username,
                "text": message.text,
                "datetime": message.created_at.isoformat(),
            }
            for message in chat.messages.select_related('sender').order_by('created_at')
        ]

        return JsonResponse({
            "success": True,
            "chat_id": chat.id,
            "name": chat.name,
            "current_user": request.user.username,
            "messages": messages,
        })

class GroupCreateFormView(LoginRequiredMixin, View):

    def get(self, request):
        contacts = (
            get_users_by_section(request.user, "friends")
            .order_by("username")
        )

        data = [
            {
                "id": contact.id, # pyright: ignore[reportAttributeAccessIssue]
                "username": contact.username,
                "avatar": (
                    contact.profile.avatar.url # pyright: ignore[reportAttributeAccessIssue]
                    if getattr(contact, "profile", None) and contact.profile.avatar # pyright: ignore[reportAttributeAccessIssue]
                    else None
                )
            }
            for contact in contacts
        ]

        return JsonResponse({
            "success": True,
            "results": data
        })

class CreateGroupview(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        name = request.POST.get("name", "").strip()
        user_ids = request.POST.getlist("users[]")


        if not name:
            return JsonResponse({
                "success": False,
                "error": "Назва групи не може бути порожньою"
            }, status= 400)

        if not user_ids:
            return JsonResponse({
                "success": False,
                "error": "Потрібно вибрати хоча б одного користувача"
            }, status= 400)

        users = User.objects.filter(id__in= user_ids)
        friends = get_users_by_section(request.user, "friends").filter(id__in= user_ids).values_list("id", flat= True)

        for user in users:
            if user.id not in friends: # type: ignore
                return JsonResponse({
                    "success": False,
                    "error": f"Користувач {user.username} не є другом"
                }, status=403)

        chat = Chat.objects.create(name= name, is_group= True, admin= request.user)
        chat.users.add(request.user)
        chat.users.add(*users)

        return JsonResponse(
            {
                "success": True,
                "chat_id": chat.id, # type: ignore
                "name": name,
            }
        )
