import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from produccion.models import Cliente, OrdenTrabajo


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(username="qa_admin_ord", password="1234")
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.mark.django_db
def test_get_ordenes(auth_client):
    response = auth_client.get("/api/produccion/ordenes/")

    assert response.status_code == 200


@pytest.mark.django_db
def test_post_orden(auth_client):
    cliente = Cliente.objects.create(
        nombre="Cliente QA",
        nit="QA-ORD-001",
        correo="cliente_orden@example.com",
        direccion="Zona QA",
    )
    payload = {
        "codigo": "OT-QA-001",
        "cliente_id": cliente.id,
        "descripcion": "Orden creada desde prueba de integracion",
        "fecha_entrega": "2026-12-31",
        "estado": "En progreso",
    }

    response = auth_client.post("/api/produccion/ordenes/", payload, format="json")

    assert response.status_code == 201
    assert OrdenTrabajo.objects.filter(codigo="OT-QA-001").exists()
