from django.contrib import admin
from .models import Cliente, OrdenTrabajo, Tarea, RegistroProduccion
admin.site.register([Cliente, OrdenTrabajo, Tarea, RegistroProduccion])