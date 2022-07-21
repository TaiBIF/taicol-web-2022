from django.shortcuts import render


def catalogue(request):
    return render(request, 'taxa/catalogue.html')


def name_match(request):
    return render(request, 'taxa/name_match.html')


def taxon_tree(request):
    return render(request, 'taxa/taxon_tree.html')

    
def taxon(request):
    return render(request, 'taxa/taxon.html')
