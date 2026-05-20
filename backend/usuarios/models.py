from django.db import models
from django.contrib.auth.models import User

class Rol(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.nombre

class Trabajador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    rol = models.ForeignKey(Rol, on_delete=models.PROTECT)
    estado = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        self.nombres = self.nombres.upper()
        self.apellidos = self.apellidos.upper()
        super().save(*args, **kwargs)

    def __str__(self): return f"{self.nombres} {self.apellidos}"