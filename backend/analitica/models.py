from django.db import models

# Modelo que representa las máquinas físicas en la planta de producción
class Maquina(models.Model):
    nombre = models.CharField(max_length=100) # Nombre identificador de la máquina
    tipo = models.CharField(max_length=100) # Categoría o tipo de máquina
    estado = models.CharField(max_length=50, default='activo') # Estado operativo actual

    def __str__(self):
        return self.nombre
