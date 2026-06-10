*** Settings ***
Documentation    API tests for trabajadores. Real default path: /api/usuarios/trabajadores/
Resource         ../resources/keywords.robot
Suite Setup      Login To API

*** Test Cases ***
CP-API-TRAB-01 Get Trabajadores
    ${response}=    GET On Session    backend    ${TRABAJADORES_PATH}    headers=${AUTH_HEADERS}    expected_status=anything
    Status Should Be 200 Or 201    ${response}

CP-API-TRAB-02 Post Trabajador
    ${worker_id}=    Create QA Worker
    Should Not Be Empty    ${worker_id}
