from django.shortcuts import render
from taxa.utils import rank_map, rank_map_c


def catalogue(request):
    # 0 不開 1 開一層 2 全開
    filter = request.GET.get('filter', 0)
    return render(request, 'taxa/catalogue.html', {'filter': filter, 'ranks': rank_map_c})


def name_match(request):
    return render(request, 'taxa/name_match.html')


def taxon_tree(request):
    return render(request, 'taxa/taxon_tree.html')

    
def taxon(request, taxon_id):
    return render(request, 'taxa/taxon.html', {'taxon_id': taxon_id})
