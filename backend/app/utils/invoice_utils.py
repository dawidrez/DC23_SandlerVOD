import os
import xml.etree.ElementTree as ET
import xml.dom.minidom
from django.utils import timezone
from datetime import timedelta
from app.models import Subscription
import random

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
    net_value.text = str(total_cost)

    tax_rate = ET.SubElement(transaction, "tax_rate")
    tax_rate.text = "23%"  # Przykładowa stawka podatku

    tax_amount = ET.SubElement(transaction, "tax_amount")
    tax_amount.text = str(total_cost * 0.23)

    gross_value = ET.SubElement(transaction, "gross_value")
    gross_value.text = str(total_cost * 1.23)

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

def generate_invoice_html(invoice_xml):
    root = ET.fromstring(invoice_xml)

    table_style = """<style>
        table {
            max-width: 600px;
            margin: 0 auto;
            border-collapse: collapse;
            border: 1px solid #ccc;
        }
        th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
    """

    table_content = f"""
    <table>
    """

    transactions = root.findall('.//transaction')
    common_payment_method = root.find('.//payment_methods/method').text
    common_bank_account = root.find('.//bank_account/number').text

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
            <td>Jednostka</td>
            <td>{unit_of_measure}</td>
        </tr>
        <tr>
            <td>Ilość</td>
            <td>{quantity}</td>
        </tr>
        <tr>
            <td>Cena jednostkowa</td>
            <td>{unit_price}</td>
        </tr>
        <tr>
            <td>Wartość netto</td>
            <td>{net_value}</td>
        </tr>
        <tr>
            <td>Stawka podatku</td>
            <td>{tax_rate}</td>
        </tr>
        <tr>
            <td>Kwota podatku</td>
            <td>{tax_amount}</td>
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
    """

    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Faktura</title>
    {table_style}
</head>
<body>
    <h1>Faktura</h1>
    {table_content}
</body>
</html>
"""

    return html_content

