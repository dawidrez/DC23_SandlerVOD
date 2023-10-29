import xml.etree.ElementTree as ET
from django.utils import timezone
from datetime import timedelta
from app.models import Subscription

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

    # Tworzenie faktury
    invoice = ET.Element("invoice")

    # Nagłówek faktury
    header = ET.SubElement(invoice, "header")

    invoice_date = ET.SubElement(header, "invoice_date")
    invoice_date.text = timezone.now().strftime("%Y-%m-%d")

    invoice_number = ET.SubElement(header, "invoice_number")
    invoice_number.text = "123456"  # Unikalny numer faktury

    supplier_data = ET.SubElement(header, "supplier_data")
    supplier_name = ET.SubElement(supplier_data, "name")
    supplier_name.text = "Nazwa Dostawcy"
    supplier_address = ET.SubElement(supplier_data, "address")
    supplier_address.text = "Adres Dostawcy"
    supplier_tax_id = ET.SubElement(supplier_data, "tax_id")
    supplier_tax_id.text = "NIP Dostawcy"

    customer_data = ET.SubElement(header, "customer_data")
    customer_name = ET.SubElement(customer_data, "name")
    customer_name.text = f"{client.first_name} {client.second_name}"
    customer_address = ET.SubElement(customer_data, "address")
    customer_address.text = client.street_address + ", " + client.city
    customer_tax_id = ET.SubElement(customer_data, "tax_id")
    customer_tax_id.text = "NIP Klienta"

    # Opis transakcji
    transaction = ET.SubElement(invoice, "transaction")

    transaction_description = ET.SubElement(transaction, "description")
    transaction_description.text = f"Subskrypcja pakietu {package.name}"

    unit_of_measure = ET.SubElement(transaction, "unit_of_measure")
    unit_of_measure.text = "szt."

    quantity = ET.SubElement(transaction, "quantity")
    quantity.text = "1"

    unit_price = ET.SubElement(transaction, "unit_price")
    unit_price.text = str(package.price)

    net_value = ET.SubElement(transaction, "net_value")
    net_value.text = str(package.price)

    tax_rate = ET.SubElement(transaction, "tax_rate")
    tax_rate.text = "23%"  # Przykładowa stawka podatku

    tax_amount = ET.SubElement(transaction, "tax_amount")
    tax_amount.text = str(package.price * 0.23)

    gross_value = ET.SubElement(transaction, "gross_value")
    gross_value.text = str(package.price * 1.23)

    # Termin płatności
    payment_terms = ET.SubElement(invoice, "payment_terms")
    due_date = ET.SubElement(payment_terms, "due_date")
    due_date.text = (timezone.now() + timedelta(days=30)).strftime("%Y-%m-%d")

    # Warunki płatności
    payment_methods = ET.SubElement(invoice, "payment_methods")
    payment_method = ET.SubElement(payment_methods, "method")
    payment_method.text = "Przelew bankowy"

    bank_account = ET.SubElement(invoice, "bank_account")
    bank_account_number = ET.SubElement(bank_account, "number")
    bank_account_number.text = "12345678901234567890123456"

    invoice_tree = ET.ElementTree(invoice)

    xml_content = ET.tostring(invoice, encoding="utf-8", xml_declaration=True)
    print(xml_content.decode("utf-8"))

