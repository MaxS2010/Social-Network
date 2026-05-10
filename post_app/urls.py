from django.urls import path

from .views import PostCreateView, PostListView

urlpatterns = [    
    path(route= '', view= PostListView.as_view(), name= 'post'),
    path(route= 'create/', view= PostCreateView.as_view(), name= 'create_post'),
]
