from django.urls import path
from .views import SimularProduccionAPIView

# Rutas específicas para funcionalidades avanzadas de IA
urlpatterns = [
    # Ruta para la simulación de producción con algoritmos de IA
    path('simular-produccion/', SimularProduccionAPIView.as_view(), name='simular-produccion'),
]
