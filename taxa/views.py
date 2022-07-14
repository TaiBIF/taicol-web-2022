from django.shortcuts import render

def catalogue(request):
    return render(request, 'taxa/catalogue.html')
