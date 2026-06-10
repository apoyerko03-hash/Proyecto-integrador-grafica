import os
import smtplib
from email.message import EmailMessage
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
RECIPIENT = "apoyerko03@gmail.com"
ATTACHMENTS = [
    ROOT / "qa" / "reports" / "report.html",
    ROOT / "qa" / "reports" / "log.html",
    ROOT / "qa" / "reports" / "output.xml",
    ROOT / "qa" / "reports" / "pytest-results.xml",
    ROOT / "qa" / "evidence" / "evidencia_pruebas.html",
    ROOT / "qa" / "evidence" / "evidencia_pruebas.md",
]


def get_env(name, default=None, required=False):
    value = os.getenv(name, default)
    if required and not value:
        raise RuntimeError(f"Falta variable de entorno requerida: {name}")
    return value


def attach_if_exists(message, path):
    if not path.exists():
        print(f"Advertencia: no existe el archivo, no se adjunta: {path}")
        return

    message.add_attachment(
        path.read_bytes(),
        maintype="application",
        subtype="octet-stream",
        filename=path.name,
    )
    print(f"Adjunto agregado: {path}")


def main():
    smtp_host = get_env("SMTP_HOST", required=True)
    smtp_port = int(get_env("SMTP_PORT", "587"))
    smtp_user = get_env("SMTP_USER", required=True)
    smtp_password = get_env("SMTP_PASSWORD", required=True)
    smtp_from = get_env("SMTP_FROM", smtp_user)
    use_tls = get_env("SMTP_USE_TLS", "true").lower() in {"1", "true", "yes", "si"}

    message = EmailMessage()
    message["From"] = smtp_from
    message["To"] = RECIPIENT
    message["Subject"] = "Reportes QA automatizados - J.E.RKO"
    message.set_content(
        "Se adjuntan los reportes y evidencias disponibles de las pruebas automatizadas."
    )

    attachments = ATTACHMENTS + sorted((ROOT / "qa" / "screenshots").glob("*.png"))

    for attachment in attachments:
        attach_if_exists(message, attachment)

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        if use_tls:
            server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(message)

    print(f"Correo enviado a {RECIPIENT}")


if __name__ == "__main__":
    main()
