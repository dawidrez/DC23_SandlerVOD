#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from apscheduler.schedulers.background import BackgroundScheduler
from app.scheduled_tasks import send_custom_emails


def start_scheduler():
    scheduler = BackgroundScheduler(
        job_defaults={'misfire_grace_time': 24*60*60})
    scheduler.add_job(send_custom_emails, 'interval', minutes=60*24*7)
    scheduler.start()


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DC23_SandlerVOD.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    if os.environ.get('RUN_MAIN') == 'true':
        start_scheduler()
    main()
