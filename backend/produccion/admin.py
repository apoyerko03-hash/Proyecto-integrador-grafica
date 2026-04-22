from django.contrib import admin
from .models import Maquina, Trabajador, OrdenTrabajo

#!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
#VISTA MOMENTANEA PARA USO DEL BACKEND

#vista de Máquinas
@admin.register(Maquina)
class MaquinaAdmin(admin.ModelAdmin):
    #Columnas, barra de búsqueda y filtro
    list_display = ('nombre', 'tipo', 'estado', 'fecha_registro')
    search_fields = ('nombre', 'tipo')
    list_filter = ('estado',)
#vista de los      y rendimiento de mayor a menor por defecto
@admin.register(Trabajador)
class TrabajadorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'cargo', 'rendimiento', 'fecha_ingreso')
    search_fields = ('nombre', 'cargo')

    ordering = ('-rendimiento',)

#vista de Órdenes de Trabajo
@admin.register(OrdenTrabajo)
class OrdenTrabajoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'cliente', 'estado', 'progreso', 'fecha_creacion')
    search_fields = ('codigo', 'cliente')
    list_filter = ('estado',)