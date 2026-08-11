from django.urls import path

from . import views

urlpatterns = [
    path('name/match', views.name_match, name='name_match'),
    path('taxon/tree', views.taxon_tree, name='taxon_tree'),
    path('taxon/<taxon_id>', views.taxon, name='taxon'),
    path('catalogue', views.catalogue_search, name='catalogue'),
    path('redirect_taicol', views.redirect_taicol, name='redirect_taicol'),
    path('submit', views.register_taxon, name='register_taxon'),
    path('generate_catalogue', views.generate_catalogue, name='generate_catalogue'),
    path('send_catalogue_request', views.send_catalogue_request, name='send_catalogue_request'),
    path('send_match_catalogue_request', views.send_match_catalogue_request, name='send_match_catalogue_request'),
]
