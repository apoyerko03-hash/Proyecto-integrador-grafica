from django.db import models
from usuarios.models import Trabajador

# Modelo que representa a los clientes de la empresa
class Cliente(models.Model):
    nombre = models.CharField(max_length=200) # Nombre completo del cliente
    nit = models.CharField(max_length=50, unique=True) # Número de identificación tributaria (NIT)
    
    # Asegura que el nombre siempre se guarde en mayúsculas para consistencia
    def save(self, *args, **kwargs):
        self.nombre = self.nombre.upper()
        super().save(*args, **kwargs)
    
    def __str__(self): return self.nombre

# Modelo que representa una orden de trabajo (pedido de un cliente)
class OrdenTrabajo(models.Model):
    codigo = models.CharField(max_length=100, unique=True) # Código identificador único de la orden

    # Relación con el cliente; PROTECT evita borrar un cliente con órdenes activas
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT
    )

    descripcion = models.TextField(blank=True) # Detalles adicionales de la orden

    fecha_entrega = models.DateField() # Fecha pactada para la entrega del trabajo

    # Estado actual de la orden (PENDIENTE, EN_PROCESO, COMPLETADA, etc.)
    estado = models.CharField(
        max_length=50,
        default='PENDIENTE'
    )

    def __str__(self):
        return self.codigo

# Modelo que representa una tarea específica dentro de una orden de trabajo
class Tarea(models.Model):
    # Relación con la orden; CASCADE borra las tareas si se borra la orden
    orden = models.ForeignKey(OrdenTrabajo, on_delete=models.CASCADE, related_name='tareas')
    nombre_tarea = models.CharField(max_length=200) # Descripción de la actividad
    prod_esperada = models.FloatField() # Cantidad de producción que se espera obtener
    tiempo_estimado_horas = models.FloatField() # Horas proyectadas para completar la tarea

# Modelo que registra la ejecución real de una tarea por parte de un trabajador
class RegistroProduccion(models.Model):
    trabajador = models.ForeignKey(Trabajador, on_delete=models.PROTECT) # Quién realizó el trabajo
    tarea = models.ForeignKey(Tarea, on_delete=models.CASCADE) # Qué tarea se realizó
    cant_producida = models.FloatField() # Cuánto se produjo realmente
    tiempo_real_horas = models.FloatField() # Cuánto tiempo tomó realmente (en horas)
    # Flag para indicar si la producción fue inusual o problemática (analizado por IA)
    es_anomalia = models.BooleanField(default=False)