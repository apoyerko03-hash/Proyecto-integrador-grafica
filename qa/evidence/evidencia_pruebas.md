ID: Evidencia QA automatizada
Fecha: 2026-06-08
Responsable: QA Automation Engineer

PASO | ENTRADA O ACCION | OBSERVACIONES | EVIDENCIA
--- | --- | --- | ---
**CP-01 Login correcto** | Inicio de caso | Caso documentado | qa/reports/report.html
1 | Abrir /login | Formulario de acceso visible | qa/screenshots/login_correcto.png
2 | Ingresar admin / 1234 | Credenciales aceptadas | qa/reports/log.html
3 | Presionar ingresar | Se visualiza Dashboard | qa/reports/report.html
**CP-02 Login incorrecto** | Inicio de caso | Caso documentado | qa/reports/report.html
1 | Abrir /login | Formulario de acceso visible | qa/screenshots/login_incorrecto.png
2 | Ingresar admin / clave incorrecta | Credenciales rechazadas | qa/reports/log.html
3 | Validar permanencia en login | No se muestra Dashboard | qa/reports/report.html
**CP-03 API trabajadores** | Inicio de caso | Caso documentado | qa/reports/report.html
1 | Autenticar contra API | Token obtenido | qa/reports/log.html
2 | GET trabajadores | Status 200 | qa/reports/report.html
3 | POST trabajador QA | Status 201 o 200 | qa/reports/output.xml
**CP-04 API ordenes** | Inicio de caso | Caso documentado | qa/reports/report.html
1 | Autenticar contra API | Token obtenido | qa/reports/log.html
2 | GET ordenes | Status 200 | qa/reports/report.html
3 | POST orden QA | Status 201 o 200 | qa/reports/output.xml
**CP-05 API produccion** | Inicio de caso | Caso documentado | qa/reports/report.html
1 | Autenticar contra API | Token obtenido | qa/reports/log.html
2 | GET registros de produccion | Status 200 | qa/reports/report.html
3 | POST registro QA | Status 201 o 200 | qa/reports/output.xml
**CP-06 IA deteccion de anomalias** | Inicio de caso | Caso documentado | qa/reports/report.html
1 | Ejecutar prueba unitaria detectar_anomalia | Caso menor a 60% devuelve True | qa/reports/report.html
2 | Ejecutar prueba unitaria rango normal | Caso normal devuelve False | qa/reports/log.html
3 | Ejecutar endpoint IA configurable | Respuesta contiene recomendacion, anomalia o riesgo | qa/reports/output.xml
