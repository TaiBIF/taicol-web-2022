from django.shortcuts import render
from django.utils import timezone
from datetime import datetime, timedelta


def about(request):
    return render(request, 'pages/about.html')


def policy(request):
    now = timezone.now() + timedelta(hours=8)
    today = now.strftime("%Y-%m-%d")
    return render(request, 'pages/data_policy.html', {'today': today})


def index(request):
    return render(request, 'pages/index.html')
