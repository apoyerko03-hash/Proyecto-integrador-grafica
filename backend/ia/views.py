from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
from .serializers import SimulacionRequestSerializer
from produccion.models import OrdenTrabajo, RegistroProduccion, Tarea
from usuarios.models import Trabajador


# ViewSet para simular el rendimiento de producción usando modelos matemáticos
class SimularProduccionAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Valida los parámetros de entrada (orden_id y cantidad_trabajadores)
        serializer = SimulacionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        orden_id = serializer.validated_data['orden_id']
        cantidad_trabajadores = serializer.validated_data['cantidad_trabajadores']

        # Verifica que la orden exista
        try:
            orden = OrdenTrabajo.objects.get(id=orden_id)
        except OrdenTrabajo.DoesNotExist:
            return Response(
                {'error': 'Orden de trabajo no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Calcula el tiempo teórico total de todas las tareas de la orden
        tareas = Tarea.objects.filter(orden=orden)
        tiempo_estimado_horas = tareas.aggregate(
            total=Sum('tiempo_estimado_horas')
        )['total'] or 0

        # Lógica de simulación: Factor de eficiencia decreciente
        # Se asume que añadir más trabajadores reduce el tiempo, pero con rendimientos decrecientes
        # debido a la saturación del espacio o necesidad de sincronización.
        factor_base = 0.85  # Parámetro de ajuste de curva
        factor_cantidad = cantidad_trabajadores ** (1 / factor_base)

        # Calcula el tiempo predicho aplicando el factor de cantidad de trabajadores
        tiempo_predicho_horas = round(
            tiempo_estimado_horas / factor_cantidad,
            2
        )

        # Determina si hay riesgo de retraso (si el predicho supera por mucho al estimado inicial)
        riesgo_retraso = tiempo_predicho_horas > (tiempo_estimado_horas * 1.10)

        trabajadores_disponibles = Trabajador.objects.filter(estado=True).count()
        porcentaje_capacidad = (
            (cantidad_trabajadores / trabajadores_disponibles) * 100
            if trabajadores_disponibles > 0 else 0
        )

        estados_cerrados = ['Completada', 'Completado', 'FINALIZADA', 'COMPLETADA', 'CANCELADA', 'CERRADA']
        ordenes_activas = OrdenTrabajo.objects.exclude(estado__in=estados_cerrados)
        otras_ordenes_activas = ordenes_activas.exclude(id=orden.id)
        total_otras_ordenes = otras_ordenes_activas.count()

        hoy = timezone.localdate()
        ordenes_mas_urgentes = 0

        if orden.fecha_entrega:
            ordenes_mas_urgentes = otras_ordenes_activas.filter(
                fecha_entrega__lt=orden.fecha_entrega
            ).count()

        ordenes_proximas = otras_ordenes_activas.filter(
            fecha_entrega__gte=hoy,
            fecha_entrega__lte=hoy + timedelta(days=3)
        ).count()

        riesgo_despriorizacion = (
            porcentaje_capacidad >= 70 and total_otras_ordenes > 0
        ) or (
            porcentaje_capacidad >= 50 and ordenes_mas_urgentes > 0
        )

        nivel_riesgo = 'BAJO'
        if porcentaje_capacidad >= 90 and total_otras_ordenes > 0:
            nivel_riesgo = 'ALTO'
        elif riesgo_despriorizacion or porcentaje_capacidad >= 70:
            nivel_riesgo = 'MEDIO'

        recomendaciones = []

        if porcentaje_capacidad >= 90 and total_otras_ordenes > 0:
            recomendaciones.append(
                'Cuidado: esta simulacion concentra casi toda la capacidad operativa en una sola orden.'
            )
            recomendaciones.append(
                'Reserve personal minimo para no detener otras ordenes activas.'
            )
        elif porcentaje_capacidad >= 70 and total_otras_ordenes > 0:
            recomendaciones.append(
                'La asignacion es alta. Revise si otras ordenes pueden esperar antes de ejecutarla.'
            )

        if ordenes_mas_urgentes > 0:
            recomendaciones.append(
                f'Hay {ordenes_mas_urgentes} orden(es) con fecha de entrega mas cercana que la orden simulada.'
            )

        if ordenes_proximas > 0:
            recomendaciones.append(
                f'Hay {ordenes_proximas} orden(es) activas con vencimiento en los proximos 3 dias.'
            )

        if riesgo_retraso:
            recomendaciones.append(
                'El escenario mantiene riesgo de retraso; aumente personal o revise tareas criticas.'
            )

        if not recomendaciones:
            recomendaciones.append(
                'La asignacion no compromete de forma critica la capacidad global segun las ordenes activas actuales.'
            )
        
        # Estructura la respuesta común
        response_data = {
            'orden_id': orden_id,
            'codigo_orden': orden.codigo,
            'tiempo_estimado_horas': round(tiempo_estimado_horas, 2),
            'tiempo_predicho_horas': round(tiempo_predicho_horas, 2),
            'tiempo_predicho_dias': round(tiempo_predicho_horas / 24, 2),
            'tiempo_estimado_dias': round(tiempo_estimado_horas / 24, 2),
            'cantidad_trabajadores': cantidad_trabajadores,
            'riesgo_retraso': riesgo_retraso,
            'total_trabajadores_disponibles': trabajadores_disponibles,
            'porcentaje_capacidad_usada': round(porcentaje_capacidad, 2),
            'ordenes_activas': ordenes_activas.count(),
            'otras_ordenes_activas': total_otras_ordenes,
            'ordenes_mas_urgentes': ordenes_mas_urgentes,
            'ordenes_proximas': ordenes_proximas,
            'riesgo_despriorizacion': riesgo_despriorizacion,
            'nivel_riesgo_operativo': nivel_riesgo,
            'recomendaciones': recomendaciones,
        }

        return Response(response_data, status=status.HTTP_200_OK)


class RankingEficienciaAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        registros = RegistroProduccion.objects.select_related(
            'trabajador',
            'tarea'
        ).all()

        acumulado = {}

        for registro in registros:
            trabajador_id = registro.trabajador_id
            esperado = float(registro.tarea.prod_esperada or 0)
            real = float(registro.cant_producida or 0)

            if trabajador_id not in acumulado:
                acumulado[trabajador_id] = {
                    'trabajador_id': trabajador_id,
                    'trabajador': f'{registro.trabajador.nombres} {registro.trabajador.apellidos}',
                    'produccion_real': 0,
                    'produccion_esperada': 0,
                    'registros': 0,
                }

            acumulado[trabajador_id]['produccion_real'] += real
            acumulado[trabajador_id]['produccion_esperada'] += esperado
            acumulado[trabajador_id]['registros'] += 1

        ranking = []

        for item in acumulado.values():
            esperado = item['produccion_esperada']
            real = item['produccion_real']
            desviacion = real - esperado
            rendimiento = (real / esperado) * 100 if esperado > 0 else 0

            if desviacion < 0:
                ranking.append({
                    **item,
                    'produccion_real': round(real, 2),
                    'produccion_esperada': round(esperado, 2),
                    'desviacion': round(desviacion, 2),
                    'rendimiento_porcentaje': round(rendimiento, 2),
                })

        ranking.sort(key=lambda item: item['desviacion'])

        return Response(ranking, status=status.HTTP_200_OK)
