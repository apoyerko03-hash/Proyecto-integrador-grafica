import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from produccion.models import Cliente, OrdenTrabajo, RegistroProduccion, Tarea
from usuarios.models import Rol, Trabajador


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(username="qa_admin_prod", password="1234")
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.fixture
def production_data(db):
    rol = Rol.objects.create(nombre="QA PRODUCCION")
    user = User.objects.create_user(username="qa_prod_worker", password="1234")
    trabajador = Trabajador.objects.create(
        user=user,
        rol=rol,
        nombres="QA",
        apellidos="Produccion",
        correo="qa_prod_worker@example.com",
    )
    cliente = Cliente.objects.create(nombre="Cliente QA Prod", nit="QA-PROD-001")
    orden = OrdenTrabajo.objects.create(
        codigo="OT-QA-PROD-001",
        cliente=cliente,
        descripcion="Orden para pruebas de produccion",
        fecha_entrega="2026-12-31",
        estado="En progreso",
    )
    tarea = Tarea.objects.create(
        orden=orden,
        nombre_tarea="Corte QA",
        unidad_medida="pieza",
        prod_esperada=100,
        tiempo_estimado_horas=8,
    )
    return trabajador, tarea


@pytest.mark.django_db
def test_get_produccion(auth_client):
    response = auth_client.get("/api/produccion/registros/")

    assert response.status_code == 200


@pytest.mark.django_db
def test_post_produccion(auth_client, production_data):
    trabajador, tarea = production_data
    payload = {
        "trabajador": trabajador.id,
        "tarea": tarea.id,
        "cant_producida": 80,
        "tiempo_real_horas": 8,
    }

    response = auth_client.post("/api/produccion/registros/", payload, format="json")

    assert response.status_code == 201
    assert RegistroProduccion.objects.filter(trabajador=trabajador, tarea=tarea).exists()
