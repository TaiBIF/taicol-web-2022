from django.urls import path

from . import views

urlpatterns = [
    # path('update_catalogue_table', views.update_catalogue_table, name='update_catalogue_table'),
    # path('update_catalogue_table', views.update_catalogue_table_search, name='update_catalogue_table'),
    # path('get_autocomplete_taxon', views.get_autocomplete_taxon, name='get_autocomplete_taxon'),
    path('get_autocomplete_taxon_by_solr', views.get_autocomplete_taxon_by_solr, name='get_autocomplete_taxon_by_solr'),
    path('download_search_results', views.download_search_results, name='download_search_results'),
    path('send_download_request', views.send_download_request, name='send_download_request'),
    # path('get_sub_tree', views.get_sub_tree, name='get_sub_tree'),
    path('get_taxon_path', views.get_taxon_path, name='get_taxon_path'),
    path('get_sub_tree_list', views.get_sub_tree_list, name='get_sub_tree_list'),
    path('update_search_stat', views.update_search_stat, name='update_search_stat'),
    path('get_match_result', views.get_match_result, name='get_match_result'),
    # path('download_match_results', views.download_match_results, name='download_match_results'),
    path('download_match_results_offline', views.download_match_results_offline, name='download_match_results_offline'),
    path('send_feedback', views.send_feedback, name='send_feedback'),
    path('send_register_taxon', views.send_register_taxon, name='send_register_taxon'),
    path('get_root_tree', views.get_root_tree, name='get_root_tree'),
    path('get_taxon_higher', views.get_taxon_higher, name='get_taxon_higher'),
    path('update_solr', views.update_solr, name='update_solr'),
    # path('update/name', views.update_name, name='update_name'),
    # path('update/reference', views.update_reference, name='update_reference'),
    # path('get_taxon_by_higher', views.get_taxon_by_higher, name='get_taxon_by_higher'),
    # path('get_taxon_history', views.get_taxon_history, name='get_taxon_history'),
]
