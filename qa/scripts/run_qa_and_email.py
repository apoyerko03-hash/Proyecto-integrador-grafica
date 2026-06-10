import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def run_step(name, command):
    print(f"\n=== {name} ===")
    print(" ".join(command))
    result = subprocess.run(command, cwd=ROOT)
    if result.returncode != 0:
        print(f"Advertencia: '{name}' termino con codigo {result.returncode}.")
    return result.returncode


def main():
    failures = []

    steps = [
        (
            "Robot Framework E2E y API",
            ["robot", "-d", "qa/reports", "qa/robot"],
        ),
        (
            "Pytest backend",
            [
                sys.executable,
                "-m",
                "pytest",
                "backend/tests",
                "-v",
                "--junitxml=qa/reports/pytest-results.xml",
            ],
        ),
        (
            "Generar evidencia",
            [sys.executable, "qa/scripts/generate_evidence.py"],
        ),
        (
            "Enviar correo",
            [sys.executable, "qa/scripts/send_report_email.py"],
        ),
    ]

    for name, command in steps:
        code = run_step(name, command)
        if code != 0:
            failures.append(name)

    if failures:
        print("\nFlujo terminado con advertencias o fallos en:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("\nFlujo QA terminado correctamente.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
