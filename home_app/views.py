from django.shortcuts import render
from django.views.generic.base import TemplateView

from user_app.forms import UserExpandInfoForm
from post_app.forms import PostCreationForm
# Create your views here.


class HomeView(TemplateView):
    template_name = 'home_app/home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        user = self.request.user

        if user.is_authenticated and not user.is_profile_complete: # type: ignore
            context['form_info'] = UserExpandInfoForm(
                instance= user # type: ignore
            )
        context["form_create"] = PostCreationForm()

        return context
