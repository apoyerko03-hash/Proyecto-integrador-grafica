from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, OrdenTrabajoViewSet, TareaViewSet, RegistroProduccionViewSet

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'ordenes', OrdenTrabajoViewSet)
router.register(r'tareas', TareaViewSet)
router.register(r'registros', RegistroProduccionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]