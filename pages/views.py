from django.shortcuts import render
from django.utils import timezone
from datetime import datetime, timedelta



def index(request):
    return render(request, 'pages/index.html')


def article(request):
    return render(request, 'pages/article_list.html')


def article_detail(request, article_id):
    return render(request, 'pages/article_de.html')


def download(request):
    return render(request, 'pages/download.html')


def news(request):
    return render(request, 'pages/news_list.html')


def news_detail(request, news_id):
    return render(request, 'pages/news_de.html')


def statistics(request):
    return render(request, 'pages/statistics.html')


def api(request):
    return render(request, 'pages/api.html')


# ----- DONE ----- #

def about(request):
    return render(request, 'pages/about.html')


def policy(request):
    now = timezone.now() + timedelta(hours=8)
    today = now.strftime("%Y-%m-%d")
    return render(request, 'pages/data_policy.html', {'today': today})

