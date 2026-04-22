from django.db import models

class Maquina(models.Model):
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=100)
    estado = models.CharField(max_length=50, default='activo')
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} - {self.estado}"

class Trabajador(models.Model):
    nombre = models.CharField(max_length=150)
    cargo = models.CharField(max_length=100)
    rendimiento = models.FloatField(default=0.0) # Ejemplo: 85.5 (%)
    fecha_ingreso = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.nombre

class OrdenTrabajo(models.Model):
    ESTADOS = (
        ('Pendiente', 'Pendiente'),
        ('En Proceso', 'En Proceso'),
        ('Completada', 'Completada'),
        ('Retrasada', 'Retrasada'),
    )

    codigo = models.CharField(max_length=20, unique=True)
    cliente = models.CharField(max_length=150)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='Pendiente')
    progreso = models.IntegerField(default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.codigo} - {self.cliente}"