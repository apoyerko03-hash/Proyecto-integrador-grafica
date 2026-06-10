# README QA

Estructura de pruebas automatizadas para el sistema de soporte a decisiones J.E.RKO.

## Estructura creada

- `qa/robot/e2e`: pruebas E2E con Robot Framework y SeleniumLibrary.
- `qa/robot/api`: pruebas API con Robot Framework y RequestsLibrary.
- `qa/robot/resources`: variables y keywords reutilizables.
- `qa/reports`: salida de reportes Robot.
- `qa/screenshots`: capturas E2E.
- `qa/evidence`: evidencias en Markdown y HTML.
- `qa/scripts`: scripts para generar evidencias y enviar reportes.
- `backend/tests/unit`: pruebas unitarias pytest para logica de IA.
- `backend/tests/integration`: pruebas de integracion de APIs Django.

## Instalar dependencias

Ejecutar desde la raiz del proyecto:

```bash
pip install robotframework robotframework-seleniumlibrary robotframework-requests pytest pytest-django
```

Para ejecutar E2E con Chrome, tener Chrome instalado y un WebDriver compatible disponible en el PATH.

## Ejecutar pruebas

Backend/API con Robot:

```bash
robot -d qa/reports qa/robot/api
```

E2E con Robot:

```bash
robot -d qa/reports qa/robot/e2e
```

Unitarias e integracion con pytest:

```bash
pytest backend/tests -v
```

Ejecutar solo unitarias de IA:

```bash
pytest backend/tests/unit -v
```

Ejecutar un archivo especifico:

```bash
pytest backend/tests/unit/test_ia_anomalias.py -v
pytest backend/tests/integration/test_api_ordenes.py -v
```

Ejecutar un test especifico:

```bash
pytest backend/tests/unit/test_ia_anomalias.py::test_detectar_anomalia_devuelve_true_si_produccion_menor_al_60_por_ciento -v
```

Ejecutar una suite Robot especifica:

```bash
robot -d qa/reports qa/robot/api/api_trabajadores.robot
robot -d qa/reports qa/robot/e2e/login.robot
```

Generar evidencias:

```bash
python qa/scripts/generate_evidence.py
```

Ejecutar todo y enviar correo en un solo comando:

```bash
python qa/scripts/run_qa_and_email.py
```

Ese comando intenta ejecutar Robot, pytest, generar `evidencia_pruebas.html` y enviar el correo. Para que sea completo, el frontend debe estar levantado en `FRONTEND_URL`, el backend en `BACKEND_URL`, las credenciales de API deben existir y las variables SMTP deben estar configuradas.

## Enviar correo

El script envia a `apoyerko03@gmail.com` y adjunta, si existen:

- `qa/reports/report.html`
- `qa/reports/log.html`
- `qa/reports/output.xml`
- `qa/reports/pytest-results.xml`
- `qa/evidence/evidencia_pruebas.html`
- `qa/evidence/evidencia_pruebas.md`
- capturas `qa/screenshots/*.png`

Variables de entorno requeridas:

```bash
set SMTP_HOST=smtp.gmail.com
set SMTP_PORT=587
set SMTP_USER=tu_correo@gmail.com
set SMTP_PASSWORD=tu_app_password
set SMTP_FROM=tu_correo@gmail.com
set SMTP_USE_TLS=true
python qa/scripts/send_report_email.py
```

En PowerShell:

```powershell
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USER="tu_correo@gmail.com"
$env:SMTP_PASSWORD="tu_app_password"
$env:SMTP_FROM="tu_correo@gmail.com"
$env:SMTP_USE_TLS="true"
python qa/scripts/send_report_email.py
```

El correo no se envia automaticamente al ejecutar pruebas sueltas. Para hacerlo automatico usa `python qa/scripts/run_qa_and_email.py`, o primero genera reportes/evidencias y luego ejecuta `python qa/scripts/send_report_email.py`.

Para Gmail normalmente necesitas una App Password, no la contrasena normal de tu cuenta. Si falta algun archivo adjunto, el script muestra una advertencia y continua.

## URLs configurables

Las variables principales estan en `qa/robot/resources/variables.robot`:

- `FRONTEND_URL=http://localhost:3000`
- `BACKEND_URL=http://127.0.0.1:8000`

Rutas reales detectadas en este backend:

- Trabajadores: `/api/usuarios/trabajadores/`
- Ordenes: `/api/produccion/ordenes/`
- Produccion/registros: `/api/produccion/registros/`
- IA actual: `/api/ia/simular-produccion/`

Si tus endpoints tienen otros nombres, cambia las variables:

- `${TRABAJADORES_PATH}`
- `${ORDENES_PATH}`
- `${PRODUCCION_PATH}`
- `${IA_ANALIZAR_PATH}`

Tambien puedes sobreescribir por CLI:

```bash
robot --variable BACKEND_URL:http://127.0.0.1:8000 -d qa/reports qa/robot/api
```

## Selectores E2E requeridos

Para que las pruebas de login sean robustas, el frontend debe exponer:

- `data-testid="username-input"`
- `data-testid="password-input"`
- `data-testid="login-button"`
- `data-testid="dashboard-title"`

## Datos necesarios

Las pruebas Robot de API usan autenticacion por token y esperan que exista un usuario local:

- Usuario: `admin`
- Password: `1234`

Si tus credenciales son otras, cambia `${ADMIN_USER}` y `${ADMIN_PASSWORD}` en `qa/robot/resources/variables.robot`.
