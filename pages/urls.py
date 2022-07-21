from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('about', views.about, name='about'),
    path('policy', views.policy, name='policy'),
    path('article', views.article, name='article'),
    path('article/<article_id>', views.article_detail, name='article_detail'),
    path('download', views.download, name='download'),
    path('news', views.news, name='news'),
    path('news/<news_id>', views.news_detail, name='news_detail'),
    path('statistics', views.statistics, name='statistics'),
    path('api', views.api, name='api'),
]
