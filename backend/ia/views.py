from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.db.models import Sum
from .serializers import SimulacionRequestSerializer
from produccion.models import OrdenTrabajo, Tarea


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
        }

        return Response(response_data, status=status.HTTP_200_OK)
