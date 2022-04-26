from django.shortcuts import render

def taxa(request, id):
    data = {}
    return render(request, 'pages/taxa.html', {'data': data})
