from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view

from django.shortcuts import get_object_or_404
from django.db.models import (
    F,
    ExpressionWrapper,
    fields,
    Avg,
    Count
)

from datetime import datetime
import numpy as np
import logging

from sklearn.ensemble import IsolationForest

from produccion.models import (
    RegistroProduccion,
    Tarea,
    OrdenTrabajo
)

logger = logging.getLogger(__name__)


# =========================================================
# SIMULACIÓN DE PRODUCCIÓN
# Lógica predictiva para estimar tiempos de entrega
# =========================================================

@api_view(['POST'])
def simular_produccion(request):
    """
    Simula el tiempo que tomará completar una orden de trabajo basándose en
    el número de trabajadores asignados y el rendimiento histórico.
    """
    orden_id = request.data.get('orden_id')
    num_trabajadores = int(request.data.get('num_trabajadores', 1))

    # Validación: No se puede simular con 0 o menos trabajadores
    if num_trabajadores <= 0:
        return Response(
            {"error": "num_trabajadores debe ser mayor a 0"},
            status=400
        )

    # Obtiene la orden solicitada
    orden = get_object_or_404(OrdenTrabajo, id=orden_id)

    # Obtiene todas las tareas asociadas a esa orden
    tareas = Tarea.objects.filter(orden=orden)

    # Suma el tiempo estimado (teórico) de todas las tareas
    total_horas_necesarias = sum(
        t.tiempo_estimado_horas for t in tareas
    )

    # Obtiene el promedio histórico de cantidad producida de todos los registros
    promedio_eficiencia = (
        RegistroProduccion.objects.aggregate(
            Avg('cant_producida')
        )['cant_producida__avg'] or 100
    )

    # Factor de ajuste: Aumenta el tiempo estimado un 5% por cada trabajador extra
    # debido a la necesidad de mayor coordinación y posibles cuellos de botella.
    factor_ajuste = 1 + (num_trabajadores * 0.05)

    # Fórmula predictiva básica: (Tiempo teórico / Trabajadores) * Factor de coordinación
    tiempo_estimado = (
        total_horas_necesarias / num_trabajadores
    ) * factor_ajuste

    return Response({
        "orden": orden.codigo,
        "horas_totales": round(total_horas_necesarias, 2),
        "promedio_eficiencia": round(promedio_eficiencia, 2),
        "tiempo_predicho_horas": round(tiempo_estimado, 2),
        "dias_estimados": round(tiempo_estimado / 8, 1), # Asumiendo jornada de 8h
        "riesgo_retraso": tiempo_estimado > 40 # Alerta si la predicción supera una semana laboral
    })


# =========================================================
# DETECCIÓN DE ANOMALÍAS
# Uso de Inteligencia Artificial (Isolation Forest)
# =========================================================

class DeteccionAnomaliasView(APIView):
    """
    Utiliza el algoritmo Isolation Forest para identificar registros de producción
    que se desvían significativamente del patrón normal (anomalías).
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        trabajador_id = request.data.get('trabajador_id')
        fecha_inicio = request.data.get('fecha_inicio')
        fecha_fin = request.data.get('fecha_fin')

        # Las fechas son obligatorias para acotar el análisis
        if not fecha_inicio or not fecha_fin:
            return Response(
                {"error": "Se requieren fecha_inicio y fecha_fin"},
                status=400
            )

        try:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Formato de fecha inválido. Use YYYY-MM-DD"},
                status=400
            )

        # Filtra registros en el rango de fechas
        queryset = RegistroProduccion.objects.filter(
            fecha_hora_inicio__date__gte=fecha_inicio,
            fecha_hora_inicio__date__lte=fecha_fin
        )

        # Filtro opcional por trabajador
        if trabajador_id:
            queryset = queryset.filter(trabajador_id=trabajador_id)

        # Extrae los datos numéricos necesarios para el modelo de IA
        registros = queryset.values(
            'id',
            'cant_producida',
            'tiempo_real_horas',
            'tarea__prod_esperada'
        ).exclude(
            tiempo_real_horas__isnull=True
        ).exclude(
            tiempo_real_horas=0
        )

        if len(registros) == 0:
            return Response({"message": "No se encontraron registros"}, status=200)

        data = []
        ids = []

        for reg in registros:
            # Crea un vector de características para cada registro
            data.append([
                float(reg['cant_producida']),
                float(reg['tiempo_real_horas']),
                float(reg['tarea__prod_esperada']) if reg['tarea__prod_esperada'] else 0.0
            ])
            ids.append(reg['id'])

        if len(data) < 2:
            return Response({"message": "Se necesitan al menos 2 registros"}, status=200)

        # Convierte los datos a un array de NumPy para Scikit-Learn
        X = np.array(data)

        # Configura el modelo Isolation Forest:
        # contamination=0.1 asume que aproximadamente el 10% de los datos podrían ser anomalías
        clf = IsolationForest(contamination=0.1, random_state=42)

        # Entrena y predice (-1 indica anomalía, 1 indica normal)
        preds = clf.fit_predict(X)

        # Identifica los IDs de los registros marcados como anomalía
        anomaly_indices = np.where(preds == -1)[0]
        anomaly_ids = [ids[i] for i in anomaly_indices]

        # Marca permanentemente estos registros en la base de datos
        updated_count = 0
        if anomaly_ids:
            updated_count = RegistroProduccion.objects.filter(
                id__in=anomaly_ids
            ).update(es_anomalia=True)

        logger.info(f"Anomalías detectadas y marcadas: {updated_count}")

        return Response({
            "analizados": len(data),
            "anomalias_detectadas": len(anomaly_indices),
            "registros_actualizados": updated_count,
            "anomalias_ids": list(anomaly_ids)
        })


# =========================================================
# RANKING DE EFICIENCIA
# Cálculo de KPI: Eficiencia Real vs Esperada
# =========================================================

class RankingEficienciaView(APIView):
    """
    Calcula un ranking de trabajadores basado en su eficiencia promedio.
    Eficiencia = (Producción Real / Tiempo Real) / Producción Esperada por Hora
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        trabajador_id = request.query_params.get('trabajador_id')
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')

        # Prepara la consulta base excluyendo registros incompletos o inválidos
        queryset = RegistroProduccion.objects.select_related(
            'tarea', 'trabajador__user'
        ).exclude(
            Q(tiempo_real_horas__isnull=True) | Q(tiempo_real_horas=0) |
            Q(tarea__prod_esperada__isnull=True) | Q(tarea__prod_esperada=0)
        )

        # Aplicación de filtros si se proveen
        if trabajador_id:
            queryset = queryset.filter(trabajador_id=trabajador_id)

        if fecha_inicio:
            queryset = queryset.filter(fecha_hora_inicio__date__gte=fecha_inicio)
        
        if fecha_fin:
            queryset = queryset.filter(fecha_hora_inicio__date__lte=fecha_fin)

        # Calcula la eficiencia para cada registro usando anotaciones de base de datos
        # Esto es más eficiente que hacerlo en memoria de Python
        queryset = queryset.annotate(
            eficiencia=ExpressionWrapper(
                (F('cant_producida') / F('tiempo_real_horas')) / F('tarea__prod_esperada'),
                output_field=fields.FloatField()
            )
        )

        # Agrupa por trabajador y calcula el promedio de su eficiencia
        ranking = queryset.values(
            'trabajador_id',
            'trabajador__user__first_name',
            'trabajador__user__last_name'
        ).annotate(
            eficiencia_promedio=Avg('eficiencia'),
            total_registros=Count('id')
        ).order_by('-eficiencia_promedio') # Ordena de mayor a menor eficiencia

        resultado = []
        for item in ranking:
            resultado.append({
                "trabajador_id": item['trabajador_id'],
                "nombre": item['trabajador__user__first_name'],
                "apellido": item['trabajador__user__last_name'],
                "eficiencia_promedio": round(item['eficiencia_promedio'], 4),
                "total_registros": item['total_registros']
            })

        return Response(resultado)