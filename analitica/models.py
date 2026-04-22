from django.db import models

class Maquina(models.Model):
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=100)
    estado = models.CharField(max_length=50, default='activo')

    def __str__(self):
        return self.nombre
