from django.urls import path
from .views import (
    simular_produccion,
    DeteccionAnomaliasView,
    RankingEficienciaView
)

# Definición de rutas para el módulo de analítica e IA
urlpatterns = [
    # Endpoint para la simulación predictiva de tiempos de entrega
    path(
        'simular-produccion/',
        simular_produccion,
        name='simular-produccion'
    ),

    # Endpoint para ejecutar el modelo de IA que detecta anomalías
    path(
        'deteccion-anomalias/',
        DeteccionAnomaliasView.as_view(),
        name='deteccion-anomalias'
    ),

    # Endpoint para obtener el ranking de trabajadores por eficiencia
    path(
        'ranking-eficiencia/',
        RankingEficienciaView.as_view(),
        name='ranking-eficiencia'
    ),
]