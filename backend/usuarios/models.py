from django.db import models
from django.contrib.auth.models import User

# Modelo que representa los roles de los usuarios en el sistema (ej. Administrador, Operario, etc.)
class Rol(models.Model):
    nombre = models.CharField(max_length=50, unique=True) # Nombre único del rol
    
    # Representación en cadena del objeto, devuelve el nombre del rol
    def __str__(self): return self.nombre

# Modelo que extiende la información del usuario básico de Django con datos específicos del trabajador
class Trabajador(models.Model):
    # Relación uno a uno con el modelo User de Django para la autenticación
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    # Relación con el modelo Rol; PROTECT evita borrar un rol si tiene trabajadores asociados
    rol = models.ForeignKey(Rol, on_delete=models.PROTECT)
    estado = models.BooleanField(default=True) # Indica si el trabajador está activo o no

    # Sobrescribe el método save para asegurar que los nombres y apellidos se guarden en mayúsculas
    def save(self, *args, **kwargs):
        self.nombres = self.nombres.upper()
        self.apellidos = self.apellidos.upper()
        super().save(*args, **kwargs)

    # Representación en cadena del trabajador: Nombre Completo
    def __str__(self): return f"{self.nombres} {self.apellidos}"