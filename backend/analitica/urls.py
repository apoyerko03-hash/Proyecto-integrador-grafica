from django.urls import path
from .views import DeteccionAnomaliasView, RankingEficienciaView

urlpatterns = [
    path('deteccion-anomalias/', DeteccionAnomaliasView.as_view(), name='deteccion-anomalias'),
    path('ranking-eficiencia/', RankingEficienciaView.as_view(), name='ranking-eficiencia'),
]