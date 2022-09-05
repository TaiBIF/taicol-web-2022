from django.contrib import admin, messages
from .models import Feedback
from django import template
from django.core.mail import send_mail

register = template.Library()

type_dict = {
        "1": '學名和中文名',
        "2": '照片',
        "3": '分類資訊',
        "4": '分類階層',
        "5": '物種資訊',
        "6": '學名變遷',
        "7": '文獻',
        "8": '專家',
        "9": '相關連結',
        "10": '變更歷史'
}

class FeedbackAdmin(admin.ModelAdmin):
    list_filter = ['is_solved']
    change_form_template = './custom_change_form.html'

    def response_change(self, request, obj):
        if "_button_x" in request.POST:
            send_mail(f"TaiCOL回報錯誤—回應：[{request.POST.get('taxon_id')}] {type_dict[request.POST.get('type')]} {request.POST.get('title')}  ",'', 'no-reply@taicol.tw', [request.POST.get('email')], html_message=request.POST.get('response'))
            messages.add_message(request, messages.INFO, '信件已寄出')
            
        return super().response_change(request, obj)


admin.site.register(Feedback, FeedbackAdmin)
