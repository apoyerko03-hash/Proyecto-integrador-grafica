import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings') # Cambia 'backend' por el nombre de tu carpeta de settings
django.setup()

from usuarios.models import Rol, Trabajador
from produccion.models import Cliente, OrdenTrabajo, Tarea, RegistroProduccion
from django.contrib.auth.models import User
from datetime import date

# 1. Crear Rol
rol, _ = Rol.objects.get_or_create(nombre='OPERARIO')

# 2. Crear User y Trabajador
user, created = User.objects.get_or_create(username='trabajador1')
if created:
    user.set_password('pass123')
    user.save()
trabajador, _ = Trabajador.objects.get_or_create(user=user, nombres='JUAN', apellidos='PEREZ', rol=rol, correo='juan@mail.com')

# 3. Cliente y Orden
cliente, _ = Cliente.objects.get_or_create(nombre='MUEBLES BOLIVIA', nit='12345678')
orden, _ = OrdenTrabajo.objects.get_or_create(codigo='OT-001', cliente=cliente, fecha_entrega=date(2024, 12, 30))

# 4. Tarea y Registros (Datos para la IA)
tarea, _ = Tarea.objects.get_or_create(orden=orden, nombre_tarea='CORTE', prod_esperada=100, tiempo_estimado_horas=8)

# Creamos registros normales y uno anómalo (poco tiempo, mucha producción)
RegistroProduccion.objects.create(trabajador=trabajador, tarea=tarea, cant_producida=95, tiempo_real_horas=8)
RegistroProduccion.objects.create(trabajador=trabajador, tarea=tarea, cant_producida=10, tiempo_real_horas=10) # ANOMALIA
print("Datos cargados correctamente.")