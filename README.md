# DC23 SandlerVOD

## Running application

Create venv
```
    python -m venv venv
```

Enable venv
```
    Set-ExecutionPolicy Unrestricted -Scope Process
    .\venv\Scripts\activate
```

Install requirements
```
    python -m pip install -r .\requirements.txt
```

Run migrations
```
    python manage.py migrate
```

Run server
```
    python manage.py runserver 127.0.0.1:8000
```
