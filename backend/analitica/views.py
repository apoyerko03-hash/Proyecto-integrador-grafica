from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.db.models import Q, F, ExpressionWrapper, fields, Avg
from django.db.models.functions import Extract
from datetime import datetime
import numpy as np
from produccion.models import RegistroProduccion, Tarea
from usuarios.models import Trabajador
from sklearn.ensemble import IsolationForest
import logging

logger = logging.getLogger(__name__)


class DeteccionAnomaliasView(APIView):
    """
    Vista para detección de anomalías en registros de producción usando IsolationForest.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Espera parámetros en el cuerpo:
        {
            "trabajador_id": <id_opcional>,
            "fecha_inicio": "YYYY-MM-DD",
            "fecha_fin": "YYYY-MM-DD"
        }
        """
        trabajador_id = request.data.get('trabajador_id')
        fecha_inicio = request.data.get('fecha_inicio')
        fecha_fin = request.data.get('fecha_fin')

        # Validar parámetros requeridos
        if not fecha_inicio or not fecha_fin:
            return Response(
                {"error": "Se requieren fecha_inicio y fecha_fin"},
                status=400
            )

        try:
            # Convertir fechas
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Formato de fecha inválido. Use YYYY-MM-DD"},
                status=400
            )

        # Construir queryset base
        queryset = RegistroProduccion.objects.filter(
            fecha_hora_inicio__date__gte=fecha_inicio,
            fecha_hora_inicio__date__lte=fecha_fin
        )

        # Filtrar por trabajador si se proporciona
        if trabajador_id:
            queryset = queryset.filter(trabajador_id=trabajador_id)

        # Seleccionar solo los campos necesarios para el modelo
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

        if not registros:
            return Response(
                {"message": "No se encontraron registros para el período y trabajador especificados"},
                status=200
            )

        # Preparar datos para IsolationForest
        # Características: cant_producida, tiempo_real_horas, prod_esperada
        data = []
        ids = []
        for reg in registros:
            # Usamos las tres características
            data.append([
                float(reg['cant_producida']),
                float(reg['tiempo_real_horas']),
                float(reg['tarea__prod_esperada']) if reg['tarea__prod_esperada'] else 0.0
            ])
            ids.append(reg['id'])

        if len(data) < 2:
            return Response(
                {"message": "Se necesitan al menos 2 registros para detección de anomalías"},
                status=200
            )

        # Convertir a array de numpy
        X = np.array(data)

        # Crear y entrenar el modelo IsolationForest
        # contamination=0.1 asume que hasta el 10% de los datos pueden ser anomalías
        clf = IsolationForest(contamination=0.1, random_state=42)
        preds = clf.fit_predict(X)

        # Identificar anomalías (predicción = -1)
        anomalie_indices = np.where(preds == -1)[0]
        anomalie_ids = [ids[i] for i in anomalie_indices]

        # Actualizar los registros marcados como anomalía
        updated_count = 0
        if anomalie_ids:
            updated_count = RegistroProduccion.objects.filter(
                id__in=anomalie_ids
            ).update(es_anomalia=True)

        logger.info(
            f"Detección de anomalías completada. "
            f"Analizados {len(data)} registros, {updated_count} anomalías detectadas y actualizadas."
        )

        return Response({
            "analizados": len(data),
            "anomalias_detectadas": len(anomalie_indices),
            "registros_actualizados": updated_count,
            "anomalias_ids": list(anomalie_ids)  # Opcional: devolver los IDs actualizados
        })


class RankingEficienciaView(APIView):
    """
    Vista para obtener un ranking de trabajadores basado en su eficiencia.
    Eficiencia = (cant_producida / tiempo_real_horas) / prod_esperada de la tarea
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Opcionalmente puede filtrar por:
        - trabajador_id
        - fecha_inicio, fecha_fin (para filtrar registros por rango de fechas)
        """
        trabajador_id = request.query_params.get('trabajador_id')
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')

        # Construir queryset base
        queryset = RegistroProduccion.objects.select_related(
            'tarea',
            'trabajador__user'
        ).exclude(
            tiempo_real_horas__isnull=True
        ).exclude(
            tiempo_real_horas=0
        ).exclude(
            tarea__prod_esperada__isnull=True
        ).exclude(
            tarea__prod_esperada=0
        )

        # Aplicar filtros opcionales
        if trabajador_id:
            queryset = queryset.filter(trabajador_id=trabajador_id)

        if fecha_inicio:
            try:
                fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha_hora_inicio__date__gte=fecha_inicio)
            except ValueError:
                return Response(
                    {"error": "Formato de fecha_inicio inválido. Use YYYY-MM-DD"},
                    status=400
                )

        if fecha_fin:
            try:
                fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha_hora_inicio__date__lte=fecha_fin)
            except ValueError:
                return Response(
                    {"error": "Formato de fecha_fin inválido. Use YYYY-MM-DD"},
                    status=400
                )

        # Anotar con la puntuación de eficiencia
        queryset = queryset.annotate(
            eficiencia=ExpressionWrapper(
                F('cant_producida') / F('tiempo_real_horas') / F('tarea__prod_esperada'),
                output_field=fields.FloatField()
            )
        )

        # Agrupar por trabajador y calcular el promedio de eficiencia
        ranking = queryset.values(
            'trabajador_id',
            'trabajador__user__first_name',
            'trabajador__user__last_name'
        ).annotate(
            eficiencia_promedio=Avg('eficiencia'),
            total_registros=Count('id')
        ).order_by('-eficiencia_promedio')

        # Formatear la respuesta
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