from django.urls import path

from . import views

urlpatterns = [
    path('name/match', views.name_match, name='name_match'),
    path('taxon/tree', views.taxon_tree, name='taxon_tree'),
    path('taxon/<taxon_id>', views.taxon, name='taxon'),
]
