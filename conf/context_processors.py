from conf import settings

def turnstile(request):
    return {'TURNSTILE_SITE_KEY': settings.TURNSTILE_SITE_KEY}

def site(request):
    return {'SITE_URL': settings.SITE_URL}
