import html
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = ROOT / "qa" / "evidence"
MD_PATH = EVIDENCE_DIR / "evidencia_pruebas.md"
HTML_PATH = EVIDENCE_DIR / "evidencia_pruebas.html"


CASES = [
    {
        "id": "CP-01 Login correcto",
        "steps": [
            ("Abrir /login", "Formulario de acceso visible", "qa/screenshots/login_correcto.png"),
            ("Ingresar admin / 1234", "Credenciales aceptadas", "qa/reports/log.html"),
            ("Presionar ingresar", "Se visualiza Dashboard", "qa/reports/report.html"),
        ],
    },
    {
        "id": "CP-02 Login incorrecto",
        "steps": [
            ("Abrir /login", "Formulario de acceso visible", "qa/screenshots/login_incorrecto.png"),
            ("Ingresar admin / clave incorrecta", "Credenciales rechazadas", "qa/reports/log.html"),
            ("Validar permanencia en login", "No se muestra Dashboard", "qa/reports/report.html"),
        ],
    },
    {
        "id": "CP-03 API trabajadores",
        "steps": [
            ("Autenticar contra API", "Token obtenido", "qa/reports/log.html"),
            ("GET trabajadores", "Status 200", "qa/reports/report.html"),
            ("POST trabajador QA", "Status 201 o 200", "qa/reports/output.xml"),
        ],
    },
    {
        "id": "CP-04 API ordenes",
        "steps": [
            ("Autenticar contra API", "Token obtenido", "qa/reports/log.html"),
            ("GET ordenes", "Status 200", "qa/reports/report.html"),
            ("POST orden QA", "Status 201 o 200", "qa/reports/output.xml"),
        ],
    },
    {
        "id": "CP-05 API produccion",
        "steps": [
            ("Autenticar contra API", "Token obtenido", "qa/reports/log.html"),
            ("GET registros de produccion", "Status 200", "qa/reports/report.html"),
            ("POST registro QA", "Status 201 o 200", "qa/reports/output.xml"),
        ],
    },
    {
        "id": "CP-06 IA deteccion de anomalias",
        "steps": [
            ("Ejecutar prueba unitaria detectar_anomalia", "Caso menor a 60% devuelve True", "qa/reports/report.html"),
            ("Ejecutar prueba unitaria rango normal", "Caso normal devuelve False", "qa/reports/log.html"),
            ("Ejecutar endpoint IA configurable", "Respuesta contiene recomendacion, anomalia o riesgo", "qa/reports/output.xml"),
        ],
    },
]


def build_markdown():
    lines = [
        f"ID: Evidencia QA automatizada",
        f"Fecha: {date.today().isoformat()}",
        "Responsable: QA Automation Engineer",
        "",
        "PASO | ENTRADA O ACCION | OBSERVACIONES | EVIDENCIA",
        "--- | --- | --- | ---",
    ]

    for case in CASES:
        lines.append(f"**{case['id']}** | Inicio de caso | Caso documentado | qa/reports/report.html")
        for index, (action, observation, evidence) in enumerate(case["steps"], start=1):
            lines.append(f"{index} | {action} | {observation} | {evidence}")
    return "\n".join(lines) + "\n"


def render_evidence_cell(evidence):
    path = ROOT / evidence
    escaped = html.escape(evidence)

    if path.exists() and path.suffix.lower() in {".png", ".jpg", ".jpeg"}:
        return (
            f'<a href="../{escaped}">{escaped}</a><br>'
            f'<img src="../{escaped}" alt="{escaped}" class="evidence-img">'
        )

    if path.exists():
        return f'<a href="../{escaped}">{escaped}</a>'

    return f'{escaped}<br><span class="missing">Pendiente de generar</span>'


def build_html():
    rows = []
    for case in CASES:
        rows.append(
            f"<tr><td colspan=\"4\"><strong>{case['id']}</strong></td></tr>"
        )
        for index, (action, observation, evidence) in enumerate(case["steps"], start=1):
            rows.append(
                "<tr>"
                f"<td>{index}</td>"
                f"<td>{html.escape(action)}</td>"
                f"<td>{html.escape(observation)}</td>"
                f"<td>{render_evidence_cell(evidence)}</td>"
                "</tr>"
            )

    return f"""<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Evidencia de Pruebas QA</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 32px; color: #1f2937; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th, td {{ border: 1px solid #cbd5e1; padding: 8px; text-align: left; }}
    th {{ background: #e5e7eb; }}
    tr:nth-child(even) td {{ background: #f8fafc; }}
    a {{ color: #0f766e; font-weight: 600; }}
    .missing {{ color: #b45309; font-size: 12px; }}
    .evidence-img {{ display: block; max-width: 280px; max-height: 180px; margin-top: 8px; border: 1px solid #cbd5e1; }}
  </style>
</head>
<body>
  <p><strong>ID:</strong> Evidencia QA automatizada</p>
  <p><strong>Fecha:</strong> {date.today().isoformat()}</p>
  <p><strong>Responsable:</strong> QA Automation Engineer</p>
  <table>
    <thead>
      <tr>
        <th>PASO</th>
        <th>ENTRADA O ACCION</th>
        <th>OBSERVACIONES</th>
        <th>EVIDENCIA</th>
      </tr>
    </thead>
    <tbody>
      {''.join(rows)}
    </tbody>
  </table>
</body>
</html>
"""


def main():
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    MD_PATH.write_text(build_markdown(), encoding="utf-8")
    HTML_PATH.write_text(build_html(), encoding="utf-8")
    print(f"Evidencia generada: {MD_PATH}")
    print(f"Evidencia generada: {HTML_PATH}")


if __name__ == "__main__":
    main()
