import requests


def camunda_get_auth_token():
    """Get auth token for camunda tasklist
    Returns:
        str: auth token
    """

    url = 'https://login.cloud.camunda.io/oauth/token'

    data = {
        "client_id": "raRH8KBRm.1FaBP8DAg.Lui.cAA2-LnE",
        "client_secret": "JxJzMxXF_gkmw-Jo4LmS5V7_lsdOe~cmN061TVeKPw-ZGMs~8SA5Jc8IEGFiBY.3",
        "audience": "tasklist.camunda.io",
        "grant_type": "client_credentials"
    }

    response = requests.post(url=url, data=data)
    token = response.json()['access_token']

    return token


def camunda_start_process():
    """Start camunda process
    Returns:
        bool: True if successful
    Raises:
        Exception when response status code is not 200
    """

    url = 'https://bru-2.connectors.camunda.io/de57c218-8a31-4edc-ac03-e7d8c798e3a0/inbound/bd684f4c-05cb-47d7-b2e6-9e0a630042ec'

    response = requests.post(url=url)

    if response.status_code != 200:
        raise Exception(f'Error starting camunda process. {response.json()}')

    return True


def camunda_get_all_tasks():
    """Get all tasks from camunda
    Returns:
        list: list of tasks in json format
    Raises:
        Exception when response status code is not 200
    """

    url = 'https://bru-2.tasklist.camunda.io/de57c218-8a31-4edc-ac03-e7d8c798e3a0/v1/tasks/search'

    ret = []

    headers = {
        'Authorization': f'Bearer {camunda_get_auth_token()}'
    }

    response = requests.post(url=url, headers=headers)

    if response.status_code != 200:
        raise Exception(f'Error while getting tasks from camunda. {response.json()}')

    for r in response.json():
        if r['processName'] == 'Package_purchase' and r['taskState'] == 'CREATED':
            ret.append(r)

    return ret


def camunda_get_task(task_id):
    """Get camunda task with given task_id
    Args:
        task_id (str): id of task to be retrieved
    Returns:
        dict: task in json format
    Raises:
        Exception when response status code is not 200
    """

    url = f'https://bru-2.tasklist.camunda.io/de57c218-8a31-4edc-ac03-e7d8c798e3a0/v1/tasks/{task_id}'

    headers = {
        'Authorization': f'Bearer {camunda_get_auth_token()}'
    }

    response = requests.patch(url=url, headers=headers)

    if response.status_code != 200:
        raise Exception(f'Error getting camunda task {task_id}. {response.json()}')

    return response.json()


def camunda_get_task_variables(task_id):
    """Get variables of camunda task with given task_id
    Args:
        task_id (str): id of task for which variables are to be retrieved
    Returns:
        list: list of variables in json format
    Raises:
        Exception when response status code is not 200
    """

    url = f'https://bru-2.tasklist.camunda.io/de57c218-8a31-4edc-ac03-e7d8c798e3a0/v1/tasks/{task_id}/variables/search'

    headers = {
        'Authorization': f'Bearer {camunda_get_auth_token()}'
    }

    response = requests.post(url=url, headers=headers)

    if response.status_code != 200:
        raise Exception(f'Error getting camunda task {task_id} variables. {response.json()}')

    variables = []

    for r in response.json():
        variables.append(r)

    return variables


def camunda_complete_task(task_id):
    """Complete camunda task with given task_id
    Args:
        task_id (str): id of task to be completed
    Returns:
        bool: True if successful
    Raises:
        Exception when response status code is not 200
    """

    url = f'https://bru-2.tasklist.camunda.io/de57c218-8a31-4edc-ac03-e7d8c798e3a0/v1/tasks/{task_id}/complete'

    headers = {
        'Authorization': f'Bearer {camunda_get_auth_token()}'
    }

    response = requests.patch(url=url, headers=headers)

    if response.status_code != 200:
        raise Exception(f'Error completing camunda task. {response.json()}')

    return True


def camunda_complete_task_with_variables(task_id, variables):
    """Complete camunda task with given task_id and sets variables
    Args:
        task_id (str): id of task to be completed
        variables (list): list of variables in json format, example:
        {
            "name": "variable_name",
            "value": "variable_value"
        }
    Returns:
        bool: True if successful
    Raises:
        Exception when response status code is not 200
    """

    url = f'https://bru-2.tasklist.camunda.io/de57c218-8a31-4edc-ac03-e7d8c798e3a0/v1/tasks/{task_id}/complete'

    headers = {
        'Authorization': f'Bearer {camunda_get_auth_token()}'
    }

    task_variables = []

    for task_var in camunda_get_task_variables(task_id):
        task_variables.append({
            'name': task_var['name'],
            'value': task_var['value']
        })

    for i in range(0, len(variables)):
        found = False
        for j in range(0, len(task_variables)):
            if task_variables[j]['name'] == variables[i]['name']:
                task_variables[j]['value'] = variables[i]['value']
                found = True

        if not found:
            task_variables.append(variables[i])

    data = {
        "variables": task_variables
    }

    response = requests.patch(url=url, headers=headers, json=data)

    if response.status_code != 200:
        raise Exception(f'Error completing task and setting variable. {response.json()}')

    return True
