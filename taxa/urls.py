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
    path('get_sub_tree', views.get_sub_tree, name='get_sub_tree'),
    path('get_taxon_path', views.get_taxon_path, name='get_taxon_path'),
    path('get_sub_tree_list', views.get_sub_tree_list, name='get_sub_tree_list'),
    path('update_search_stat', views.update_search_stat, name='update_search_stat'),
    path('get_match_result', views.get_match_result, name='get_match_result'),
    path('download_match_results', views.download_match_results, name='download_match_results'),
]
