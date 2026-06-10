from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, F, ExpressionWrapper, DurationField
from django.db.models.functions import Extract
from datetime import timedelta
from .models import Cliente, OrdenTrabajo, Tarea, RegistroProduccion
from .serializers import ClienteSerializer, OrdenTrabajoSerializer, TareaSerializer, RegistroProduccionSerializer, RegistroProduccionCreateSerializer
from usuarios.models import Trabajador

ESTADOS_COMPLETADOS = ['Completada', 'Completado', 'FINALIZADA', 'COMPLETADA', 'CERRADA']

# ViewSet para la gestión de clientes
class ClienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar clientes
    """
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nombre', 'nit']
    ordering_fields = ['nombre']
    ordering = ['nombre']

# ViewSet para la gestión de órdenes de trabajo
class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar órdenes de trabajo con tareas anidadas
    """
    # prefetch_related optimiza la carga de tareas para evitar el problema N+1
    queryset = OrdenTrabajo.objects.prefetch_related('tareas').all()
    serializer_class = OrdenTrabajoSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['codigo', 'cliente__nombre']
    ordering_fields = ['fecha_entrega', 'estado']
    ordering = ['-fecha_entrega']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'completadas' or self.request.query_params.get('include_completadas') == 'true':
            return queryset
        return queryset.exclude(estado__in=ESTADOS_COMPLETADOS)

    # Acción para obtener específicamente las tareas de una orden
    @action(detail=True, methods=['get'])
    def tareas(self, request, pk=None):
        """Obtener todas las tareas de una orden específica"""
        orden = self.get_object()
        tareas = orden.tareas.all()
        serializer = TareaSerializer(tareas, many=True)
        return Response(serializer.data)

    # Acción para filtrar órdenes que están en estado PENDIENTE
    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Endpoint para obtener órdenes pendientes"""
        pendientes = self.get_queryset().filter(estado__iexact='Pendiente')
        serializer = self.get_serializer(pendientes, many=True)
        return Response(serializer.data)

    # Acción para filtrar órdenes que están EN_PROCESO
    @action(detail=False, methods=['get'])
    def en_proceso(self, request):
        """Endpoint para obtener órdenes en proceso"""
        en_proceso = self.get_queryset().filter(estado__iexact='En progreso')
        serializer = self.get_serializer(en_proceso, many=True)
        return Response(serializer.data)

# ViewSet para la gestión individual de tareas
    @action(detail=False, methods=['get'])
    def completadas(self, request):
        """Endpoint para consultar ordenes dadas de baja logica por estado completado"""
        completadas = super().get_queryset().filter(estado__in=ESTADOS_COMPLETADOS)
        serializer = self.get_serializer(completadas, many=True)
        return Response(serializer.data)

class TareaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar tareas
    """
    # select_related optimiza la obtención del cliente de la orden
    queryset = Tarea.objects.select_related('orden__cliente').all()
    serializer_class = TareaSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nombre_tarea']
    ordering_fields = ['orden', 'prod_esperada']
    ordering = ['orden']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('include_completadas') == 'true':
            return queryset
        return queryset.exclude(orden__estado__in=ESTADOS_COMPLETADOS)

    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Endpoint para obtener tareas pendientes"""
        # Nota: El modelo Tarea no parece tener un campo 'estado' directamente, 
        # pero se hereda o se filtra según la lógica de negocio
        pendientes = self.get_queryset().filter(estado='PENDIENTE')
        serializer = self.get_serializer(pendientes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def en_proceso(self, request):
        """Endpoint para obtener tareas en proceso"""
        en_proceso = self.get_queryset().filter(estado='EN_PROCESO')
        serializer = self.get_serializer(en_proceso, many=True)
        return Response(serializer.data)

# ViewSet para la gestión de registros de producción diaria
class RegistroProduccionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar registros de producción
    """
    # select_related para traer toda la jerarquía necesaria en una sola consulta
    queryset = RegistroProduccion.objects.select_related('tarea__orden__cliente', 'trabajador').all()
    serializer_class = RegistroProduccionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['tarea__nombre_tarea', 'trabajador__nombres', 'trabajador__apellidos']
    ordering_fields = ['cant_producida', 'tiempo_real_horas', 'es_anomalia']
    ordering = ['-cant_producida']

    # Determina qué serializador usar según la acción (crear vs listar/ver)
    def get_serializer_class(self):
        if self.action == 'create':
            return RegistroProduccionCreateSerializer
        return RegistroProduccionSerializer

    # Filtra los registros que la IA o el sistema marcaron como anomalías
    @action(detail=False, methods=['get'])
    def anomalas(self, request):
        """Endpoint para obtener registros marcados como anomalías"""
        anomalas = self.get_queryset().filter(es_anomalia=True)
        serializer = self.get_serializer(anomalas, many=True)
        return Response(serializer.data)

    # Filtra la producción realizada por un trabajador específico
    @action(detail=False, methods=['get'])
    def por_trabajador(self, request):
        """Endpoint para obtener registros filtrados por trabajador"""
        trabajador_id = request.query_params.get('trabajador_id')
        if trabajador_id:
            registros = self.get_queryset().filter(trabajador_id=trabajador_id)
            serializer = self.get_serializer(registros, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere trabajador_id"}, status=status.HTTP_400_BAD_REQUEST)

    # Filtra registros por un periodo de tiempo determinado
    @action(detail=False, methods=['get'])
    def por_rango_fechas(self, request):
        """Endpoint para obtener registros filtrados por rango de fechas"""
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        queryset = self.get_queryset()
        if fecha_inicio:
            queryset = queryset.filter(fecha_registro__date__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha_registro__date__lte=fecha_fin)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
