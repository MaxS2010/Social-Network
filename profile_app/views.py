from django.shortcuts import render
from django.views.generic.base import TemplateView
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .forms import ProfileForm, SignatureForm, InfoForm, Profile

# Create your views here.

class SettingsView(TemplateView):
    template_name = 'profile_app/settings.html'

class AlbomsView(TemplateView):
    template_name = 'profile_app/alboms.html'


@login_required
def edit_profile(request):
    profile, created = Profile.objects.get_or_create(user=request.user)
    user = request.user
    
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        info_form = InfoForm(request.POST, instance=user)
        signature_form = SignatureForm(request.POST, request.FILES, instance=profile)

        if form.is_valid():
            form.save()
        if info_form.is_valid():
            info_form.save()
        if signature_form.is_valid():
            signature_form.save()

        return redirect('profile_detail')
    else:
        form = ProfileForm(instance=profile)
        info_form = InfoForm(instance=user)
        signature_form = SignatureForm(instance=profile)

    return render(request, 'profile_app/settings.html', {
        'form': form,
        'info_form': info_form,
        'signature_form': signature_form,
    })
