from datetime import date, timedelta
from django.db import models
from django.db.models import Avg, Count, Sum

def collect_data(start_date, end_date):
    from .models import Subscription, Client, Package, Movie

    data = {}

    # 1. Liczba klientów subskrybujących każdy pakiet w danym okresie
    package_subscriptions = Subscription.objects.filter(
        start_date__gte=start_date, end_date__lte=end_date
    ).values('package__name').annotate(
        clients_count=Count('client', distinct=True)
    )
    data['clients_count_by_package'] = {
        package_subscription['package__name']: package_subscription['clients_count']
        for package_subscription in package_subscriptions
    }

    # 2. Analiza przychodów według rodzaju pakietu
    income_by_package = Subscription.objects.filter(
        start_date__gte=start_date, end_date__lte=end_date
    ).values('package__name').annotate(total_income=Sum('package__price'))
    data['income_by_package'] = {
        entry['package__name']: entry['total_income']
        for entry in income_by_package
    }

    # 3. Liczba aktywnych użytkowników w danym okresie
    active_clients_count = Subscription.objects.filter(
    start_date__gte=start_date, end_date__lte=end_date
    ).values('client').distinct().count()
    data['active_clients_count'] = active_clients_count

    # 4. Liczba nowych subskrypcji w danym okresie (względem poprzedniego okresu)
    previous_period_end_date = start_date - timedelta(days=1)
    new_clients = Client.objects.filter(
        subscription__start_date__gte=start_date,
        subscription__end_date__lte=end_date
    ).exclude(
        subscription__start_date__lt=start_date,
        subscription__end_date__lte=previous_period_end_date
    ).distinct()
    new_clients_count = new_clients.count()
    data['new_clients_count'] = new_clients_count

    # 5. Średni czas trwania subskrypcji
    average_duration = Subscription.objects.filter(
        start_date__gte=start_date, end_date__lte=end_date
    ).annotate(duration=models.ExpressionWrapper(
        models.F('end_date') - models.F('start_date'), 
        output_field=models.DurationField()
    )).aggregate(average_duration=Avg('duration'))
    data['average_duration'] = average_duration.get('average_duration')

    # 6. Najpopularniejsze filmy w pakietach
    popular_movies = Movie.objects.filter(
        packages__subscription__start_date__gte=start_date,
        packages__subscription__end_date__lte=end_date
    ).annotate(subscription_count=Count('packages__subscription')).order_by('-subscription_count')
    data['popular_movies'] = {
        movie.title: movie.subscription_count
        for movie in popular_movies[:5]
    }
    
    return data