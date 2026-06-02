from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, OrdenTrabajoViewSet, TareaViewSet, RegistroProduccionViewSet

# Generador automático de rutas para el módulo de producción
router = DefaultRouter()
router.register(r'clientes', ClienteViewSet) # /api/produccion/clientes/
router.register(r'ordenes', OrdenTrabajoViewSet) # /api/produccion/ordenes/
router.register(r'tareas', TareaViewSet) # /api/produccion/tareas/
router.register(r'registros', RegistroProduccionViewSet) # /api/produccion/registros/

urlpatterns = [
    # Punto de entrada para todas las rutas de este módulo
    path('', include(router.urls)),
]