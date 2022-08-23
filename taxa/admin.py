from django.contrib import admin
from .models import Feedback


class FeedbackAdmin(admin.ModelAdmin):
    list_filter = ['is_solved']

admin.site.register(Feedback, FeedbackAdmin)
