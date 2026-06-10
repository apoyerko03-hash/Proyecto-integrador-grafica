*** Settings ***
Documentation    API tests for IA. Project currently has /api/ia/simular-produccion/, not /api/ia/analizar/.
Resource         ../resources/keywords.robot
Suite Setup      Login To API

*** Test Cases ***
CP-API-IA-01 Post Analizar O Simular IA
    # If you later add /api/ia/analizar/, update ${IA_ANALIZAR_PATH} in variables.robot.
    ${order_id}=    Create QA Order
    ${payload}=    Create Dictionary    orden_id=${order_id}    cantidad_trabajadores=2
    ${response}=    POST On Session    backend    ${IA_ANALIZAR_PATH}    json=${payload}    headers=${AUTH_HEADERS}    expected_status=anything
    Status Should Be 200 Or 201    ${response}
    ${text}=    Convert To String    ${response.text}
    Should Match Regexp    ${text}    (?i)(anomalia|recomendacion|recomendaciones|riesgo)
