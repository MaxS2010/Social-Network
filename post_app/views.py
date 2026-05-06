from typing import Any

from django.http import HttpRequest, JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.views.generic import FormView, ListView, TemplateView

from post_app.forms import PostCreationForm
from .models import Post
# Create your views here.

class PostView(TemplateView):
    template_name = 'post_app/post.html'

    def get_context_data(self, **kwargs) -> dict[str, Any]:
        context = super().get_context_data(**kwargs)
        context["form_create"] = PostCreationForm()

        return context

class PostCreateView(LoginRequiredMixin, FormView):
    """
    View для створення публікації.
    
    Сторінка доступна тільки авторизованому користувачу.
    Форма відправляється через fetch, тому view повертає JSON,
    а не звичайний HTML redirect.
    """
    
    template_name = "post_app/post.html"
    form_class = PostCreationForm
    success_url = reverse_lazy("post_list")
    login_url = reverse_lazy("auth")

    def get_form_kwargs(self):
        """
        Передає у форму додатковий параметр links.
        
        У шаблоні може бути кілька полів input name="links".
        request.POST.getlist("links") збирає їх усі в один список.
        """
        kwargs = super().get_form_kwargs()
        
        if self.request.method == "POST":
            kwargs["links"] = self.request.POST.getlist("links")
            kwargs["photos"] = self.request.FILES.getlist("photos")
            
        return kwargs

    def form_valid(self, form):
        """
        Обробляє валідну форму.
        
        Зберігає пост з поточним користувачем як автором
        та повертає JSON-відповідь для JavaScript.
        """
        post = form.save(author=self.request.user)
        return JsonResponse(
            {
                "success": True,
                "message": "Публікацію створено успішно",
                "redirect_url": str(self.success_url),
                "post_id": post.id,
            }
        )

    def form_invalid(self, form):
        """
        Обробляє невалідну форму.
        
        Повертає помилки у JSON-форматі, щоб JavaScript
        міг показати їх без перезавантаження сторінки.
        """
        return JsonResponse(
            {
                "success": False,
                "errors": form.errors.get_json_data(),
            },
            status=400,
        )
