import io
import os
from googleapiclient.discovery import build
from google.oauth2 import service_account
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload


SCOPES = ['https://www.googleapis.com/auth/drive']
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(CURRENT_DIR, 'service_account.json')
PARENT_FOLDER_ID = "1olTChQIOOLS_0dAprGjxChUSTHEfQbbc"


def authenticate():
    creds = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return creds


def check_folder_exists(folder_name):
    """Check if folder exists in Google Drive, if not create it
    Args:
        folder_name (str): name of folder
    Returns:
        str: id of folder
    """

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
    """Check if file exists in Google Drive
    Args:
        file_name (str): name of file
        folder_id (str): id of folder in which file is located (OPTIONAL)

    Returns:
        str: id of file if exists else False
    """

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


def rename_file(service, file_id, new_name):
    """Rename file in Google Drive
    Args:
        service: Google Drive service instance
        file_id (str): id of file to rename
        new_name (str): new name of file
    Returns:
        bool: True if file renamed else False
    """

    try:
        file = {'name': new_name}
        service.files().update(
            fileId=file_id,
            body=file,
            fields='name'
        ).execute()
        return True
    except Exception as e:
        print(e)
        return False


def upload_file(file_path, folder_id=PARENT_FOLDER_ID, clean_up=False):
    """Upload file to Google Drive
    Args:
        file_path (str): path to local file
        folder_id (str): id of folder in which file will be uploaded
        clean_up (bool): if True, file will be deleted after upload
    """

    creds = authenticate()
    service = build('drive', 'v3', credentials=creds)

    file_name = file_path.split('/')[-1]

    file_exist = check_file_exists(file_name, folder_id)

    if file_exist:
        print(f"File {file_path.split('/')[-1]} already exists in Google Drive, changing file to old")
        file_name_old = file_name.split('.')[0] + '_old.' + file_name.split('.')[1]
        rename_file(service, file_exist, file_name_old)

    file_metadata = {
        'name': file_name,
        'parents': [folder_id]
    }

    media = MediaFileUpload(file_path, resumable=True)

    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()

    if clean_up:
        # wait until file is closed
        while media._fd is not None and not media._fd.closed:
            media._fd.close()

        os.remove(file_path)

    print('File ID: %s' % file.get('id'))


def download_file(file_name, folder_id, save_path='./temp'):
    """Download file from Google Drive
    Args:
        file_name (str): name of file to download
        folder_id (str): id of folder in which file is located
        save_path (str): path to save file
    """

    creds = authenticate()
    service = build('drive', 'v3', credentials=creds)

    file_id = check_file_exists(file_name, folder_id)

    if not file_id:
        print(f"File {file_name} does not exist in Google Drive")
        return False

    if not os.path.exists(save_path):
        os.makedirs(save_path)

    request = service.files().get_media(fileId=file_id)
    file = io.BytesIO()
    downloader = MediaIoBaseDownload(file, request)

    done = False
    while done is False:
        status, done = downloader.next_chunk()

    with open(f"{save_path}/{file_name}", 'wb') as f:
        f.write(file.getvalue())

    return True
