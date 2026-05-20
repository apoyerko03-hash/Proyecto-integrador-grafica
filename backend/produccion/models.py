from django.db import models
from usuarios.models import Trabajador

class Cliente(models.Model):
    nombre = models.CharField(max_length=200)
    nit = models.CharField(max_length=50, unique=True)
    def save(self, *args, **kwargs):
        self.nombre = self.nombre.upper()
        super().save(*args, **kwargs)
    def __str__(self): return self.nombre

class OrdenTrabajo(models.Model):
    codigo = models.CharField(max_length=100, unique=True)

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT
    )

    descripcion = models.TextField(blank=True)

    fecha_entrega = models.DateField()

    estado = models.CharField(
        max_length=50,
        default='PENDIENTE'
    )

    def __str__(self):
        return self.codigo

class Tarea(models.Model):
    orden = models.ForeignKey(OrdenTrabajo, on_delete=models.CASCADE, related_name='tareas')
    nombre_tarea = models.CharField(max_length=200)
    prod_esperada = models.FloatField()
    tiempo_estimado_horas = models.FloatField()

class RegistroProduccion(models.Model):
    trabajador = models.ForeignKey(Trabajador, on_delete=models.PROTECT)
    tarea = models.ForeignKey(Tarea, on_delete=models.CASCADE)
    cant_producida = models.FloatField()
    tiempo_real_horas = models.FloatField()
    es_anomalia = models.BooleanField(default=False)