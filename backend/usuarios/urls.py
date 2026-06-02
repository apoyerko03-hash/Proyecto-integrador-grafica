from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RolViewSet, TrabajadorViewSet, UserViewSet, CustomAuthToken

# Se utiliza DefaultRouter de DRF para generar automáticamente las rutas para los ViewSets
router = DefaultRouter()
router.register(r'roles', RolViewSet) # Rutas para /api/usuarios/roles/
router.register(r'trabajadores', TrabajadorViewSet) # Rutas para /api/usuarios/trabajadores/
router.register(r'usuarios', UserViewSet, basename='usuario') # Rutas para /api/usuarios/usuarios/

urlpatterns = [
    # Incluye todas las rutas generadas por el router
    path('', include(router.urls)),
    # Ruta manual para el login y obtención de token
    path('auth/login/', CustomAuthToken.as_view(), name='auth_login'),
]