"""conf URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from conf import settings
from django.views.static import serve
from django.conf.urls.i18n import i18n_patterns

handler404 = 'pages.views.custom_page_not_found_view'
handler500 = 'pages.views.custom_error_view'


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('taxa.urls_api')),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),

]
urlpatterns += i18n_patterns(
    path("i18n/", include("django.conf.urls.i18n")),

    path(r'', include('pages.urls')),
    path(r'', include('taxa.urls_pages')),
)