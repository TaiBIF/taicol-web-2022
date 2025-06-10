from django.urls import path

from . import views

urlpatterns = [
    path('name/match', views.name_match, name='name_match'),
    path('taxon/tree', views.taxon_tree, name='taxon_tree'),
    path('taxon/<taxon_id>', views.taxon, name='taxon'),
    path('catalogue', views.catalogue_search, name='catalogue'),
    path('redirect_taicol', views.redirect_taicol, name='redirect_taicol'),
    path('submit', views.register_taxon, name='register_taxon'),
    # path('catalogue_search', views.catalogue_search, name='catalogue_search'),
]
