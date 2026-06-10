*** Settings ***
Documentation    Basic E2E smoke test for Home.
Resource         ../resources/keywords.robot
Test Teardown    Close Browser

*** Test Cases ***
CP-Home-01 Home Should Load
    Open Browser To Frontend    /
    Wait Until Page Contains Element    css:body
    ${title}=    Get Title
    Should Not Be Empty    ${title}
    Page Should Contain Element    css:body
    Take QA Screenshot    home.png
