*** Settings ***
Documentation    Login E2E tests using robust data-testid selectors.
Resource         ../resources/keywords.robot
Test Teardown    Close Browser

*** Test Cases ***
CP-Login-01 Login Correcto
    Open Browser To Frontend    /login
    # Frontend should expose:
    # data-testid="username-input", data-testid="password-input",
    # data-testid="login-button", data-testid="dashboard-title"
    # Current fallback selectors support the existing Login.jsx inputs and submit button.
    Wait Until Element Is Visible    xpath://input[@data-testid="username-input" or @type="text"]
    Input Text    xpath://input[@data-testid="username-input" or @type="text"]    ${ADMIN_USER}
    Input Password    xpath://input[@data-testid="password-input" or @type="password"]    ${ADMIN_PASSWORD}
    Click Element    xpath://button[@data-testid="login-button" or @type="submit"]
    Wait Until Page Contains    Dashboard
    Take QA Screenshot    login_correcto.png

CP-Login-02 Login Incorrecto
    Open Browser To Frontend    /login
    Wait Until Element Is Visible    xpath://input[@data-testid="username-input" or @type="text"]
    Input Text    xpath://input[@data-testid="username-input" or @type="text"]    ${ADMIN_USER}
    Input Password    xpath://input[@data-testid="password-input" or @type="password"]    ${INVALID_PASSWORD}
    Click Element    xpath://button[@data-testid="login-button" or @type="submit"]
    Sleep    1s
    Page Should Not Contain Element    css:[data-testid="dashboard-title"]
    Location Should Contain    /login
    Take QA Screenshot    login_incorrecto.png
