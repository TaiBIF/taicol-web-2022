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
from django.views.generic.base import TemplateView
from django.views.i18n import JavaScriptCatalog

handler404 = 'pages.views.custom_page_not_found_view'
handler500 = 'pages.views.custom_error_view'


urlpatterns = [
    path("jsi18n/", JavaScriptCatalog.as_view(domain="django"), name="javascript-catalog"),
    path("i18n/", include("django.conf.urls.i18n")),
    path('admin/', admin.site.urls),
    path('', include('taxa.urls_api')),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
    path('', include('pages.urls')),
    path('', include('taxa.urls_pages')),
    path("robots.txt",TemplateView.as_view(template_name="robots.txt", content_type="text/plain"),),
    path("sitemap.xml",TemplateView.as_view(template_name="sitemap.xml", content_type="text/xml"),),
]


urlpatterns += i18n_patterns(
    path("jsi18n/", JavaScriptCatalog.as_view(domain="django"), name="javascript-catalog"),
    path("i18n/", include("django.conf.urls.i18n")),
    path('', include('pages.urls')),
    path('', include('taxa.urls_pages')),
)
