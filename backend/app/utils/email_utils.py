from django.core.mail import send_mail
from django.conf import settings



def send_email(subject, message, recipient_list):
   send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        recipient_list,
        fail_silently=False,
    )

def send_email_html(subject, message, recipient_list, html_message):
   send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        recipient_list,
        html_message=html_message,
        fail_silently=False,
    )