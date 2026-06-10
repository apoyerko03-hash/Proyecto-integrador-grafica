*** Settings ***
Documentation    API tests for ordenes. Real default path: /api/produccion/ordenes/
Resource         ../resources/keywords.robot
Suite Setup      Login To API

*** Test Cases ***
CP-API-ORD-01 Get Ordenes
    ${response}=    GET On Session    backend    ${ORDENES_PATH}    headers=${AUTH_HEADERS}    expected_status=anything
    Status Should Be 200 Or 201    ${response}

CP-API-ORD-02 Post Orden
    ${order_id}=    Create QA Order
    Should Not Be Empty    ${order_id}
