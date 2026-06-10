*** Settings ***
Documentation    API tests for production records. Real default path: /api/produccion/registros/
Resource         ../resources/keywords.robot
Suite Setup      Login To API

*** Test Cases ***
CP-API-PROD-01 Get Produccion
    ${response}=    GET On Session    backend    ${PRODUCCION_PATH}    headers=${AUTH_HEADERS}    expected_status=anything
    Status Should Be 200 Or 201    ${response}

CP-API-PROD-02 Post Produccion
    ${worker_id}=    Create QA Worker
    ${task_id}=    Create QA Task
    ${payload}=    Create Dictionary    trabajador=${worker_id}    tarea=${task_id}    cant_producida=80    tiempo_real_horas=8
    ${response}=    POST On Session    backend    ${PRODUCCION_PATH}    json=${payload}    headers=${AUTH_HEADERS}    expected_status=anything
    Status Should Be 200 Or 201    ${response}
