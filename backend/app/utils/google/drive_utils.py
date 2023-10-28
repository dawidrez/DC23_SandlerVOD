from googleapiclient.discovery import build
from google.oauth2 import service_account
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive']
SERVICE_ACCOUNT_FILE = 'service_account.json'
PARENT_FOLDER_ID = "1olTChQIOOLS_0dAprGjxChUSTHEfQbbc"


def authenticate():
    creds = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return creds


def check_folder_exists(folder_name):
    """Check if folder exists in Google Drive, if not create it and return the id"""
    creds = authenticate()
    service = build('drive', 'v3', credentials=creds)
    page_token = None
    while True:
        response = service.files().list(
            q="mimeType='application/vnd.google-apps.folder'",
            spaces='drive',
            fields='nextPageToken, files(id, name)',
            pageToken=page_token
        ).execute()
        for file in response.get('files', []):
            if file.get('name') == folder_name:
                return file.get('id')
        page_token = response.get('nextPageToken', None)
        if page_token is None:
            break

    file_metadata = {
        'name': folder_name,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [PARENT_FOLDER_ID]
    }
    file = service.files().create(body=file_metadata, fields='id').execute()
    return file.get('id')


def check_file_exists(file_name, folder_id=PARENT_FOLDER_ID):
    """Check if file exists in Google Drive, if not return False else return file id"""
    creds = authenticate()
    service = build('drive', 'v3', credentials=creds)
    page_token = None
    while True:
        response = service.files().list(
            q=f"name='{file_name}' and parents in '{folder_id}'",
            spaces='drive',
            fields='nextPageToken, files(id, name)',
            pageToken=page_token
        ).execute()
        for file in response.get('files', []):
            if file.get('name') == file_name:
                return file.get('id')
        page_token = response.get('nextPageToken', None)
        if page_token is None:
            break
    return False
