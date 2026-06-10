from django.urls import path

from .views import RankingEficienciaAPIView, SimularProduccionAPIView


urlpatterns = [
    path('simular-produccion/', SimularProduccionAPIView.as_view(), name='simular-produccion'),
    path('ranking-eficiencia/', RankingEficienciaAPIView.as_view(), name='ranking-eficiencia'),
]
