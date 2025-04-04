from django.shortcuts import render
from django.utils import timezone
from datetime import datetime, timedelta


def index(request):
    return render(request, 'pages/index.html')


def article(request):
    return render(request, 'pages/article_list.html')


def article_detail(request, slug):
    context = {'slug': slug}

    return render(request, 'pages/article_de.html', context)


def download(request):
    return render(request, 'pages/download.html')


def news(request):
    return render(request, 'pages/news_list.html')


def news_detail(request, slug):
    context = {'slug': slug}

    return render(request, 'pages/news_de.html', context)


def statistics(request):
    return render(request, 'pages/statistics.html')


def api(request):
    return render(request, 'pages/api.html')


# ----- DONE ----- #

def custom_page_not_found_view(request, exception):
    return render(request, "404.html")


def custom_error_view(request, exception=None):
    return render(request, "404.html")


def about(request):
    return render(request, 'pages/about.html')


def policy(request):
    now = timezone.now() + timedelta(hours=8)
    today = now.strftime("%Y-%m-%d")
    return render(request, 'pages/data_policy.html', {'today': today})
