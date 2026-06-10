*** Variables ***
# Main URLs. Override from CLI if needed:
# robot --variable FRONTEND_URL:http://localhost:5173 -d qa/reports qa/robot/e2e
${FRONTEND_URL}              http://localhost:3000
${BACKEND_URL}               http://127.0.0.1:8000

# Default credentials for local QA runs. Change if your seed data is different.
${ADMIN_USER}                yerko
${ADMIN_PASSWORD}            OFICIALYERKOAPO03$
${INVALID_PASSWORD}          clave_incorrecta

# Real routes detected in this Django project. If your API changes, edit here.
${LOGIN_PATH}                /api/usuarios/auth/login/
${TRABAJADORES_PATH}         /api/usuarios/trabajadores/
${ROLES_PATH}                /api/usuarios/roles/
${CLIENTES_PATH}             /api/produccion/clientes/
${ORDENES_PATH}              /api/produccion/ordenes/
${TAREAS_PATH}               /api/produccion/tareas/
${PRODUCCION_PATH}           /api/produccion/registros/
${IA_ANALIZAR_PATH}          /api/ia/simular-produccion/

${BROWSER}                   chrome
${SELENIUM_TIMEOUT}          10s
${SCREENSHOT_DIR}            qa/screenshots
