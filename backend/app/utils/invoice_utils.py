import os
import xml.etree.ElementTree as ET
import xml.dom.minidom
from django.utils import timezone
from datetime import timedelta
from app.models import Subscription
import random
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image


def calculate_price(package, start_date, end_date):
    # Obliczenie liczby rozpoczętych miesięcy subskrypcji
    subscription_duration = end_date - start_date
    subscription_months = subscription_duration.days // 30  # Przyjmujemy średnio 30 dni w miesiącu

    return package.price * subscription_months


def generate_invoice_xml(subscription):
    client = subscription.client
    package = subscription.package
    start_date = subscription.start_date
    end_date = subscription.end_date

    num_months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month + 1)
    total_cost = num_months * package.price


    # Tworzenie faktury
    invoice = ET.Element("invoice")

    # Nagłówek faktury
    header = ET.SubElement(invoice, "header")

    invoice_date = ET.SubElement(header, "invoice_date")
    invoice_date.text = timezone.now().strftime("%Y-%m-%d")

    invoice_number = ET.SubElement(header, "invoice_number")
    invoice_number.text = ''.join(random.choice('0123456789') for _ in range(6))  # Unikalny numer faktury

    supplier_data = ET.SubElement(header, "supplier_data")
    supplier_name = ET.SubElement(supplier_data, "name")
    supplier_name.text = "Sandler VOD"
    supplier_address = ET.SubElement(supplier_data, "address")
    supplier_address.text = "Narutowicza 11/12"
    supplier_tax_id = ET.SubElement(supplier_data, "tax_id")
    supplier_tax_id.text = "1231231231"

    customer_data = ET.SubElement(header, "customer_data")
    customer_name = ET.SubElement(customer_data, "name")
    customer_name.text = f"{client.first_name} {client.second_name}"
    customer_address = ET.SubElement(customer_data, "address")
    customer_address.text = client.street_address + ", " + client.city

    # Opis transakcji
    transaction = ET.SubElement(invoice, "transaction")

    transaction_description = ET.SubElement(transaction, "description")
    transaction_description.text = f"Subskrypcja pakietu {package.name}"

    unit_of_measure = ET.SubElement(transaction, "start_date")
    unit_of_measure.text = start_date.strftime("%Y-%m-%d")

    unit_of_measure = ET.SubElement(transaction, "end_date")
    unit_of_measure.text = end_date.strftime("%Y-%m-%d")

    unit_of_measure = ET.SubElement(transaction, "unit_of_measure")
    unit_of_measure.text = "miesiąc"

    quantity = ET.SubElement(transaction, "quantity")
    quantity.text = str(num_months)

    unit_price = ET.SubElement(transaction, "unit_price")
    unit_price.text = str(package.price)

    net_value = ET.SubElement(transaction, "net_value")
    net_value.text = str(int(total_cost))

    tax_rate = ET.SubElement(transaction, "tax_rate")
    tax_rate.text = "23%"  # Przykładowa stawka podatku

    tax_amount = ET.SubElement(transaction, "tax_amount")
    tax_amount.text = str(total_cost * 0.23)

    gross_value = ET.SubElement(transaction, "gross_value")
    gross_value.text = str(int(total_cost * 1.23))

    # Termin płatności
    payment_terms = ET.SubElement(invoice, "payment_terms")
    due_date = ET.SubElement(payment_terms, "due_date")
    due_date.text = (start_date + timedelta(days=30)).strftime("%Y-%m-%d")

    # Warunki płatności
    payment_methods = ET.SubElement(invoice, "payment_methods")
    payment_method = ET.SubElement(payment_methods, "method")
    payment_method.text = "Przelew bankowy"

    bank_account = ET.SubElement(invoice, "bank_account")
    bank_account_number = ET.SubElement(bank_account, "number")
    bank_account_number.text = "12345678901234567890123456"

    xml_content = ET.tostring(invoice, encoding="utf-8", xml_declaration=True)
    formated_xml = xml.dom.minidom.parseString(xml_content).toprettyxml(indent="    ", encoding="utf-8")

    if not os.path.exists("./temp"):
        os.makedirs("./temp")

    temp_xml_filename = f"./temp/invoice_{subscription.id}.xml"

    with open(temp_xml_filename, "wb") as f:
        f.write(formated_xml)

    return xml_content.decode("utf-8"), temp_xml_filename

def generate_invoice_html(invoice_xml, client):
    root = ET.fromstring(invoice_xml)

    table_style = """<style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }
    
            h1 {
                color: #333;
            }
    
            p {
                color: #666;
            }
    
            table {
                max-width: 30%;
                border-collapse: collapse;
                margin: 20px 0;
                color: black;
                height: 100%;
                background-color: #80868B;
                border: 1px solid #ccc;
                
            }
    
            th,
            td {
                border: 1px solid #ccc;
                padding: 10px;
                text-align: left;
            }
    
            th {
                background-color: #1E2F97;
                color: white;
            }
    
            .parent-container {
                text-align: center;
                color: white;
            }
            
            .info-table {
                width: 50%;
                float: left;
                margin-bottom: 20px;
            }
    
            .invoice-image {
                margin-left: 20px;
                margin-bottom: 20px;
                display: inline-block;
                width: 28%;
                height: 240px;
            }
    </style>
    """

    pronoun = "Pani" if client.gender == "female" else "Panu"

    thank_you_message = f"""
    <div class="parent-container">
        Dziękujemy {pronoun} za zakup subskrypcji na naszej stronie, poniżej przesyłamy fakturę.
    </div>
    """

    transactions = root.findall('.//transaction')
    common_payment_method = root.find('.//payment_methods/method').text
    common_bank_account = root.find('.//bank_account/number').text

    table_content = f"""
    <div class="parent-container">
    <table style="display: inline-block;">
    """

    for transaction in transactions:
        description = transaction.find('description').text
        unit_of_measure = transaction.find('unit_of_measure').text
        quantity = transaction.find('quantity').text
        unit_price = transaction.find('unit_price').text
        net_value = transaction.find('net_value').text
        tax_rate = transaction.find('tax_rate').text
        tax_amount = transaction.find('tax_amount').text
        gross_value = transaction.find('gross_value').text
        payment_method = common_payment_method
        account_number = common_bank_account

        table_content += f"""
        <tr>
            <th>Nazwa</th>
            <th>Wartość</th>
        </tr>
        <tr>
            <td>Opis</td>
            <td>{description}</td>
        </tr>
        <tr>
            <td>Wartość netto</td>
            <td>{net_value}</td>
        </tr>
        <tr>
            <td>Wartość brutto</td>
            <td>{gross_value}</td>
        </tr>
        <tr>
            <td>Metoda płatności</td>
            <td>{payment_method}</td>
        </tr>
        <tr>
            <td>Numer konta</td>
            <td>{account_number}</td>
        </tr>
        """

    table_content += """
        </table>	
        <img src="https://filmozercy.com/uploads/images/original/adam-sandler-w-filmie-nieoszlifowane-diamenty-dla-netflix.jpeg" alt="Invoice Image" class="invoice-image">
        </div>
    """

    # Add an encouragement message at the end
    encouragement_message = """
    <div class="parent-container">
        Zachęcamy do zapoznania się z naszymi innymi dostępnymi pakietami.
    </div>
    """

    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Faktura</title>
    {table_style}
</head>
<body style="background: url('https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L3B4MTU4NDgwMy1pbWFnZS1rd3Z4dmxjai5qcGc.jpg') center/cover no-repeat fixed;">
    <h1 class="parent-container">Dziękujemy za zakupy!</h1>
    {thank_you_message}
    {table_content}
    {encouragement_message}
</body>
</html>
"""

    return html_content


def generate_invoice_pdf(invoice_xml, dir):
    root = ET.fromstring(invoice_xml)

    c = canvas.Canvas(os.path.join(dir, "invoice.pdf"), pagesize=A4, bottomup=0)

    width = A4[0]
    height = A4[1]

    pdfmetrics.registerFont(TTFont('Times-Roman', 'Times.ttf'))

    # Data wystawienia
    c.setFont("Times-Roman", 12)
    c.drawRightString(width * 0.9, 28, "Data wystawienia: " + root.find(".//invoice_date").text)

    # Logo
    img = Image.open(os.path.join("logo", "LOGO.png"))
    img = img.transpose(Image.FLIP_TOP_BOTTOM)  # Flip the image vertically
    img_path = os.path.join(dir, "flipped_logo.png")
    img.save(img_path)

    # Draw the flipped logo
    c.drawImage(img_path, width*0.1, -130, width=130, preserveAspectRatio=True)  # Use positive height

    # Numer faktury
    c.setFont("Times-Bold", 20)
    c.drawString(width*0.6, 100, "Faktura nr: " + root.find(".//invoice_number").text)

    c.setFillColorRGB(0, 0, 0)

    # Sprzedawca
    c.setFont("Times-Bold", 15)
    c.drawString(width * 0.1, 160, "Sprzedawca")
    c.line(width * 0.1, 170, width * 0.4, 170)
    c.setFont("Times-Roman", 12)
    c.drawString(width * 0.1, 190, root.find(".//supplier_data/name").text)
    c.drawString(width * 0.1, 205, root.find(".//supplier_data/address").text)
    c.drawString(width * 0.1, 220, root.find(".//supplier_data/tax_id").text)

    # Nabywca
    c.setFont("Times-Bold", 15)
    c.drawString(width * 0.6, 160, "Nabywca")
    c.line(width * 0.6, 170, width * 0.9, 170)
    c.setFont("Times-Roman", 12)
    c.drawString(width * 0.6, 190, root.find(".//customer_data/name").text)
    c.drawString(width * 0.6, 205, root.find(".//customer_data/address").text)


    offset_x_table = width*0.1
    offset_y_table = 280
    width_table = width*0.8
    height_table = 56
    # Tabela
    c.rect(offset_x_table, offset_y_table, width_table, height_table, stroke=1, fill=0)


    c.line(offset_x_table, offset_y_table+height_table*0.5, offset_x_table+width_table, offset_y_table+height_table*0.5)

    c.setFont("Times-Roman", 9)
    c.drawCentredString(offset_x_table + width_table*0.015, offset_y_table + height_table*0.32, "lp.")
    c.line(offset_x_table + width_table*0.03, offset_y_table, offset_x_table + width_table*0.03, offset_y_table+height_table)
    c.setFont("Times-Roman", 10)
    c.drawRightString(offset_x_table + width_table * 0.027, offset_y_table + height_table * 0.8, "1.")

    c.setFont("Times-Roman", 9)
    c.drawCentredString(offset_x_table + width_table * 0.215, offset_y_table + height_table * 0.32, "Usługa")
    c.line(offset_x_table + width_table * 0.42, offset_y_table, offset_x_table + width_table * 0.42, offset_y_table + height_table)
    c.setFont("Times-Roman", 10)
    c.drawRightString(offset_x_table + width_table * 0.417, offset_y_table + height_table * 0.8, root.find(".//transaction/description").text)

    c.setFont("Times-Roman", 9)
    c.drawCentredString(offset_x_table + width_table * 0.45, offset_y_table + height_table * 0.32, "Ilość")
    c.line(offset_x_table + width_table * 0.48, offset_y_table, offset_x_table + width_table * 0.48,
           offset_y_table + height_table)
    c.setFont("Times-Roman", 10)
    c.drawRightString(offset_x_table + width_table * 0.477, offset_y_table + height_table * 0.8,
                      root.find(".//transaction/quantity").text)

    c.setFont("Times-Roman", 9)
    c.drawCentredString(offset_x_table + width_table * 0.52, offset_y_table + height_table * 0.32, "Jm")
    c.line(offset_x_table + width_table * 0.56, offset_y_table, offset_x_table + width_table * 0.56,
           offset_y_table + height_table)
    c.setFont("Times-Roman", 10)
    c.drawRightString(offset_x_table + width_table * 0.557, offset_y_table + height_table * 0.8,
                      root.find(".//transaction/unit_of_measure").text)

    c.setFont("Times-Roman", 9)
    c.drawCentredString(offset_x_table + width_table * 0.62, offset_y_table + height_table * 0.32, "Cena Netto")
    c.line(offset_x_table + width_table * 0.68, offset_y_table, offset_x_table + width_table * 0.68,
           offset_y_table + height_table)
    c.setFont("Times-Roman", 10)
    c.drawRightString(offset_x_table + width_table * 0.677, offset_y_table + height_table * 0.8,
                      "{:.2f}".format(float(root.find(".//transaction/unit_price").text)).replace(".", ","))

    c.setFont("Times-Roman", 9)
    c.drawCentredString(offset_x_table + width_table * 0.72, offset_y_table + height_table * 0.32, "VAT")
    c.line(offset_x_table + width_table * 0.76, offset_y_table, offset_x_table + width_table * 0.76,
           offset_y_table + height_table)
    c.setFont("Times-Roman", 10)
    c.drawRightString(offset_x_table + width_table * 0.757, offset_y_table + height_table * 0.8,
                      root.find(".//transaction/tax_rate").text)

    c.setFont("Times-Roman", 9)
    c.drawCentredString(offset_x_table + width_table * 0.82, offset_y_table + height_table * 0.32, "Kwota Netto")
    c.line(offset_x_table + width_table * 0.88, offset_y_table, offset_x_table + width_table * 0.88,
           offset_y_table + height_table)
    c.setFont("Times-Roman", 10)
    c.drawRightString(offset_x_table + width_table * 0.877, offset_y_table + height_table * 0.8,
                      "{:.2f}".format(float(root.find(".//transaction/net_value").text)).replace(".", ","))


    c.setFont("Times-Roman", 9)
    c.drawCentredString(offset_x_table + width_table * 0.94, offset_y_table + height_table * 0.32, "Kwota Brutto")
    c.line(offset_x_table + width_table * 1, offset_y_table, offset_x_table + width_table * 1,
           offset_y_table + height_table)
    c.setFont("Times-Roman", 10)
    c.drawRightString(offset_x_table + width_table * 0.997, offset_y_table + height_table * 0.8,
                      "{:.2f}".format(float(root.find(".//transaction/gross_value").text)).replace(".", ","))


    # Zapłata
    c.setFont("Times-Roman", 12)
    c.drawString(width * 0.41, 380, "Termin zapłaty: " + root.find(".//payment_terms/due_date").text)
    c.drawString(width * 0.41, 395, "Metoda płatności: " + root.find(".//payment_methods/method").text)
    c.drawString(width * 0.41, 410, "Numer konta: " + root.find(".//bank_account/number").text)

    c.showPage()
    c.save()

    return os.path.join(dir, "invoice.pdf")
