from datetime import date, timedelta
from app.utils.email_utils import send_email
from django.db import models


def send_custom_emails():
    from .models import Subscription, Client, Package, Movie

    # 1. Wysyłanie powiadomień o kończących się subskrypcjach
    upcoming_end_date = date.today() + timedelta(days=7)
    expiring_subscriptions = Subscription.objects.filter(
        end_date=upcoming_end_date)
    for subscription in expiring_subscriptions:
        client = subscription.client
        package = subscription.package
        subject = 'Twoja subskrypcja wkrótce się kończy!'
        message = f'Cześć {client.first_name},\n\nZauważyliśmy, że Twoja subskrypcja na pakiet "{package.name}" kończy się {subscription.end_date}. Czy chciałbyś ją przedłużyć?\n\nPozdrawiamy,\nZespół SandlerVOD'
        send_email(subject, message, client.email)

    # 2. Wysyłanie rekomendacji filmów na podstawie ich ocen
    high_rated_movies = Movie.objects.filter(rating__gte=4.5)[:3]
    recommended_titles = ", ".join(
        [movie.title for movie in high_rated_movies])
    if high_rated_movies.exists():
        for client in Client.objects.all():
            subject = 'Polecamy filmy z wysokimi ocenami!'
            message = f'Cześć {client.first_name},\n\nOto kilka filmów z wysokimi ocenami, które mogą Cię zainteresować: {recommended_titles}.\n\nPozdrawiamy,\nZespół SandlerVOD'
            send_email(subject, message, client.email)

    # 3. Wysyłanie promocji dla stałych klientów
    for client in Client.objects.all():
        client_subscriptions_count = Subscription.objects.filter(
            client=client).count()
        if client_subscriptions_count > 5:
            subject = 'Specjalna oferta dla Ciebie!'
            message = f'Cześć {client.first_name},\n\nJesteś dla nas ważnym klientem! Dlatego przygotowaliśmy dla Ciebie specjalną ofertę zniżkową na kolejne pakiety. Skontaktuj się z nami, aby dowiedzieć się więcej!\n\nPozdrawiamy,\nZespół SandlerVOD'
            send_email(subject, message, client.email)

    # 4. Sugestia nowego pakietu dla klienta
    for client in Client.objects.all():
        new_package = Package.objects.exclude(
            subscription__client=client).first()
        if new_package:
            subject = 'Odkryj nasz nowy pakiet!'
            message = f'Cześć {client.first_name},\n\nZastanawiałeś się nad wypróbowaniem naszego pakietu "{new_package.name}"? Zawiera on wiele interesujących filmów, które mogą Cię zainteresować.\n\nPozdrawiamy,\nZespół SandlerVOD'
            send_email(subject, message, client.email)

    # 5. Powiadomienie o nowym filmie w ofercie
    new_movies = Movie.objects.filter(release_year=date.today().year)
    if new_movies.exists():
        for client in Client.objects.all():
            for new_movie in new_movies:
                subject = 'Mamy nowy film!'
                message = f'Cześć {client.first_name},\n\nMamy nowy film w naszej ofercie! "{new_movie.title}" jest już dostępny w naszej bibliotece.\n\nPozdrawiamy,\nZespół SandlerVOD'
                send_email(subject, message, client.email)

    # 6. Sugerowanie pakietu na podstawie obecnych subskrypcji klienta
    for client in Client.objects.all():
        client_subscriptions = Subscription.objects.filter(client=client)
        for subscription in client_subscriptions:
            current_package = subscription.package
            # Znajdź najczęściej subskrybowane pakiety przez użytkowników, którzy mają ten sam pakiet co obecny klient
            suggested_packages = Subscription.objects.filter(package__name=current_package.name).values(
                'package__name').annotate(count=models.Count('package__name')).order_by('-count')[:1]
            for suggested_package in suggested_packages:
                if suggested_package['package__name'] != current_package.name:
                    subject = 'Sprawdź nasz polecany pakiet!'
                    message = f'Cześć {client.first_name}, \n\nZauważyliśmy, że masz pakiet "{current_package.name}". Wielu naszych użytkowników, którzy mają ten pakiet, również subskrybuje pakiet {suggested_package["package__name"]}". Może warto go sprawdzić?\n\nPozdrawiamy,\nZespół SandlerVOD'
                    send_email(subject, message, client.email)

    # 7. Sugerowanie filmów z wysokimi ocenami, których klient jeszcze nie oglądał
    for client in Client.objects.all():
        unwatched_high_rated_movies = Movie.objects.filter(rating__gte=4.5)[:3]
        for movie in unwatched_high_rated_movies:
            packages_with_movie = Package.objects.filter(movies__in=[movie])
            client_subscriptions = Subscription.objects.filter(client=client)
            for package in packages_with_movie:
                if package not in [sub.package for sub in client_subscriptions]:
                    subject = 'Odkryj filmy, które mogą Ci się spodobać!'
                    message = f'Cześć {client.first_name},\n\nZauważyliśmy, że nie oglądałeś jeszcze filmu "{movie.title}", który ma wysoką ocenę. Znajduje się on w pakiecie "{package.name}". Może warto go sprawdzić?\n\nPozdrawiamy,\nZespół SandlerVOD'
                    send_email(subject, message, client.email)

    # 8. Zachęcanie klientów do podzielenia się opinią na temat filmów z ich obecnych subskrypcji
    for client in Client.objects.all():
        client_subscriptions = Subscription.objects.filter(
            client=client, end_date__gte=date.today())
        for subscription in client_subscriptions:
            package = subscription.package
            movies_in_package = package.movies.all()
            for movie in movies_in_package:
                subject = 'Podziel się swoją opinią!'
                message = f'Cześć {client.first_name},\n\nOstatnio miałeś dostęp do filmu "{movie.title}" dzięki subskrypcji pakietu "{package.name}". Chcielibyśmy poznać Twoją opinię na jego temat! Kliknij poniższy link, aby dodać swoją recenzję:\n\n[link do recenzji]\n\nPozdrawiamy,\nZespół SandlerVOD'
                send_email(subject, message, client.email)

    # 9. Wysyłanie e-maili do użytkowników, którzy nie korzystali z platformy przez ostatni miesiąc
    one_month_ago = date.today() - timedelta(days=30)

    for client in Client.objects.all():
        # Sprawdź, czy klient ma jakąkolwiek subskrypcję, która zakończyła się w ciągu ostatniego miesiąca
        recent_subscription = Subscription.objects.filter(
            client=client, end_date__gte=one_month_ago).exists()

        # Jeśli klient nie miał żadnej subskrypcji w ciągu ostatniego miesiąca, wysyłaj e-mail
        if not recent_subscription:
            subject = 'Tęsknimy za Tobą w SandlerVOD!'
            message = f'Cześć {client.first_name},\n\nZauważyliśmy, że nie korzystałeś z naszej platformy od jakiegoś czasu. Mamy dla Ciebie specjalną ofertę! Wróć do nas i skorzystaj z 10% zniżki na dowolny pakiet!\n\nPozdrawiamy,\nZespół SandlerVOD'
            send_email(subject, message, client.email)

    print(f"Wysłano e-maile do klientów.")
