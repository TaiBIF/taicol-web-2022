from django.urls import path

from . import views

urlpatterns = [
    path('catalogue', views.catalogue, name='catalogue'),
    path('name/match', views.name_match, name='name_match'),
    path('taxon/tree', views.taxon_tree, name='taxon_tree'),
    path('taxon/<taxon_id>', views.taxon, name='taxon'),
    path('update_catalogue_table', views.update_catalogue_table, name='update_catalogue_table'),
    path('get_autocomplete_taxon', views.get_autocomplete_taxon, name='get_autocomplete_taxon'),
    path('download_search_results', views.download_search_results, name='download_search_results'),
]
