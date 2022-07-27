from django.shortcuts import render


def catalogue(request):
    # 0 不開 1 開一層 2 全開
    option = request.GET.get('option', 0)
    return render(request, 'taxa/catalogue.html', {'option': option})


def name_match(request):
    return render(request, 'taxa/name_match.html')


def taxon_tree(request):
    return render(request, 'taxa/taxon_tree.html')

    
def taxon(request, taxon_id):
    return render(request, 'taxa/taxon.html', {'taxon_id': taxon_id})
