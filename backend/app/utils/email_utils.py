from django.core.mail import send_mail, EmailMessage
from django.conf import settings


def send_email(subject, message, recipient_list):
   send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        recipient_list,
        fail_silently=False,
    )


def send_email_html(subject, html_message, recipient_list, invoice_pdf):
    email = EmailMessage(subject, html_message, settings.EMAIL_HOST_USER, recipient_list)

    email.content_subtype = 'html'

    file_path = invoice_pdf
    with open(file_path, 'rb') as file:
        email.attach('invoice.pdf', file.read(), 'application/pdf')

    email.send()
