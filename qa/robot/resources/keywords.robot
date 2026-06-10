*** Settings ***
Library    Collections
Library    DateTime
Library    OperatingSystem
Library    RequestsLibrary
Library    SeleniumLibrary
Library    String
Resource   variables.robot

*** Keywords ***
Open Browser To Frontend
    [Arguments]    ${path}=/
    Set Selenium Timeout    ${SELENIUM_TIMEOUT}
    Open Browser    ${FRONTEND_URL}${path}    ${BROWSER}
    Maximize Browser Window

Take QA Screenshot
    [Arguments]    ${filename}
    Create Directory    ${SCREENSHOT_DIR}
    Capture Page Screenshot    ${SCREENSHOT_DIR}/${filename}

Create Backend Session
    Create Session    backend    ${BACKEND_URL}    verify=${False}

Login To API
    [Arguments]    ${username}=${ADMIN_USER}    ${password}=${ADMIN_PASSWORD}
    Create Backend Session
    ${payload}=    Create Dictionary    username=${username}    password=${password}
    ${response}=    POST On Session    backend    ${LOGIN_PATH}    json=${payload}    expected_status=anything
    Should Be Equal As Integers    ${response.status_code}    200
    ${json}=    Evaluate    $response.json()
    Dictionary Should Contain Key    ${json}    token
    ${token}=    Get From Dictionary    ${json}    token
    ${headers}=    Create Dictionary    Authorization=Token ${token}    Content-Type=application/json
    Set Test Variable    ${AUTH_HEADERS}    ${headers}
    Set Test Variable    ${AUTH_TOKEN}    ${token}

Status Should Be 200 Or 201
    [Arguments]    ${response}
    Should Be True    ${response.status_code} == 200 or ${response.status_code} == 201

Create Unique Suffix
    ${timestamp}=    Get Current Date    result_format=%Y%m%d%H%M%S
    ${random}=    Generate Random String    5    [LOWER]
    ${suffix}=    Set Variable    ${timestamp}${random}
    RETURN    ${suffix}

Ensure Role Exists
    [Arguments]    ${role_name}=QA OPERARIO
    Set Test Variable    ${ROLE_ID}    ${EMPTY}
    ${payload}=    Create Dictionary    nombre=${role_name}
    ${response}=    POST On Session    backend    ${ROLES_PATH}    json=${payload}    headers=${AUTH_HEADERS}    expected_status=anything
    IF    ${response.status_code} == 201
        ${body}=    Evaluate    $response.json()
        ${created_role_id}=    Get From Dictionary    ${body}    id
        Set Test Variable    ${ROLE_ID}    ${created_role_id}
    END
    IF    ${response.status_code} != 201
        ${list_response}=    GET On Session    backend    ${ROLES_PATH}    headers=${AUTH_HEADERS}    expected_status=anything
        Should Be Equal As Integers    ${list_response.status_code}    200
        ${roles}=    Evaluate    $list_response.json()
        FOR    ${role}    IN    @{roles}
            ${name}=    Get From Dictionary    ${role}    nombre
            IF    '${name}' == '${role_name}'
                ${existing_role_id}=    Get From Dictionary    ${role}    id
                Set Test Variable    ${ROLE_ID}    ${existing_role_id}
            END
        END
    END
    Should Not Be Empty    ${ROLE_ID}

Create QA Worker
    Ensure Role Exists
    ${suffix}=    Create Unique Suffix
    ${user}=    Create Dictionary    username=qa_${suffix}    email=qa_${suffix}@example.com    first_name=QA    last_name=Worker
    ${payload}=    Create Dictionary    user=${user}    rol_id=${ROLE_ID}    nombres=QA    apellidos=Worker ${suffix}    correo=qa_worker_${suffix}@example.com
    ${response}=    POST On Session    backend    ${TRABAJADORES_PATH}    json=${payload}    headers=${AUTH_HEADERS}    expected_status=anything
    Status Should Be 200 Or 201    ${response}
    ${body}=    Evaluate    $response.json()
    ${worker_id}=    Get From Dictionary    ${body}    id
    RETURN    ${worker_id}

Create QA Client
    ${suffix}=    Create Unique Suffix
    ${payload}=    Create Dictionary    nombre=Cliente QA ${suffix}    nit=QA-${suffix}    correo=cliente_${suffix}@example.com    direccion=Zona QA
    ${response}=    POST On Session    backend    ${CLIENTES_PATH}    json=${payload}    headers=${AUTH_HEADERS}    expected_status=anything
    Status Should Be 200 Or 201    ${response}
    ${body}=    Evaluate    $response.json()
    ${client_id}=    Get From Dictionary    ${body}    id
    RETURN    ${client_id}

Create QA Order
    ${client_id}=    Create QA Client
    ${suffix}=    Create Unique Suffix
    ${payload}=    Create Dictionary    codigo=OT-QA-${suffix}    cliente_id=${client_id}    descripcion=Orden creada por pruebas automatizadas    fecha_entrega=2026-12-31    estado=En progreso
    ${response}=    POST On Session    backend    ${ORDENES_PATH}    json=${payload}    headers=${AUTH_HEADERS}    expected_status=anything
    Status Should Be 200 Or 201    ${response}
    ${body}=    Evaluate    $response.json()
    ${order_id}=    Get From Dictionary    ${body}    id
    RETURN    ${order_id}

Create QA Task
    ${order_id}=    Create QA Order
    ${payload}=    Create Dictionary    orden=${order_id}    nombre_tarea=Corte QA    unidad_medida=pieza    prod_esperada=100    tiempo_estimado_horas=8
    ${response}=    POST On Session    backend    ${TAREAS_PATH}    json=${payload}    headers=${AUTH_HEADERS}    expected_status=anything
    Status Should Be 200 Or 201    ${response}
    ${body}=    Evaluate    $response.json()
    ${task_id}=    Get From Dictionary    ${body}    id
    RETURN    ${task_id}
