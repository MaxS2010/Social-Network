from django.urls import path

from .views import PostCreateView, PostView

urlpatterns = [    
    path(route= '', view= PostView.as_view(), name= 'post'),
    path(route= 'create/', view= PostCreateView.as_view(), name= 'create_post'),
]
