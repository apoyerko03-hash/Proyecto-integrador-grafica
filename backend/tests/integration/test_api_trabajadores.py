import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from usuarios.models import Rol, Trabajador


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(username="qa_admin_trab", password="1234")
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.mark.django_db
def test_get_trabajadores(auth_client):
    response = auth_client.get("/api/usuarios/trabajadores/")

    assert response.status_code == 200


@pytest.mark.django_db
def test_post_trabajador(auth_client):
    rol = Rol.objects.create(nombre="QA OPERARIO")
    payload = {
        "user": {
            "username": "qa_trabajador",
            "email": "qa_trabajador@example.com",
            "first_name": "QA",
            "last_name": "Trabajador",
        },
        "rol_id": rol.id,
        "nombres": "QA",
        "apellidos": "Trabajador",
        "correo": "qa_trabajador_perfil@example.com",
    }

    response = auth_client.post("/api/usuarios/trabajadores/", payload, format="json")

    assert response.status_code == 201
    assert Trabajador.objects.filter(correo="qa_trabajador_perfil@example.com").exists()
