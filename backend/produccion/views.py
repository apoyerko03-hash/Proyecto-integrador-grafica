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


class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar órdenes de trabajo con tareas anidadas
    """
    queryset = OrdenTrabajo.objects.prefetch_related('tareas').all()
    serializer_class = OrdenTrabajoSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['codigo', 'cliente__nombre']
    ordering_fields = ['fecha_entrega', 'estado']
    ordering = ['-fecha_entrega']

    @action(detail=True, methods=['get'])
    def tareas(self, request, pk=None):
        """Obtener todas las tareas de una orden específica"""
        orden = self.get_object()
        tareas = orden.tareas.all()
        serializer = TareaSerializer(tareas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Endpoint para obtener órdenes pendientes"""
        pendientes = self.get_queryset().filter(estado='PENDIENTE')
        serializer = self.get_serializer(pendientes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def en_proceso(self, request):
        """Endpoint para obtener órdenes en proceso"""
        en_proceso = self.get_queryset().filter(estado='EN_PROCESO')
        serializer = self.get_serializer(en_proceso, many=True)
        return Response(serializer.data)


class TareaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar tareas
    """
    queryset = Tarea.objects.select_related('orden__cliente').all()
    serializer_class = TareaSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nombre_tarea']
    ordering_fields = ['orden', 'prod_esperada']
    ordering = ['orden']

    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Endpoint para obtener tareas pendientes"""
        pendientes = self.get_queryset().filter(estado='PENDIENTE')
        serializer = self.get_serializer(pendientes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def en_proceso(self, request):
        """Endpoint para obtener tareas en proceso"""
        en_proceso = self.get_queryset().filter(estado='EN_PROCESO')
        serializer = self.get_serializer(en_proceso, many=True)
        return Response(serializer.data)


class RegistroProduccionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar registros de producción
    """
    queryset = RegistroProduccion.objects.select_related('tarea__orden__cliente', 'trabajador').all()
    serializer_class = RegistroProduccionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['tarea__nombre_tarea', 'trabajador__nombres', 'trabajador__apellidos']
    ordering_fields = ['cant_producida', 'tiempo_real_horas', 'es_anomalia']
    ordering = ['-cant_producida']

    def get_serializer_class(self):
        if self.action == 'create':
            return RegistroProduccionCreateSerializer
        return RegistroProduccionSerializer

    @action(detail=False, methods=['get'])
    def anomalas(self, request):
        """Endpoint para obtener registros marcados como anomalías"""
        anomalas = self.get_queryset().filter(es_anomalia=True)
        serializer = self.get_serializer(anomalas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def por_trabajador(self, request):
        """Endpoint para obtener registros filtrados por trabajador"""
        trabajador_id = request.query_params.get('trabajador_id')
        if trabajador_id:
            registros = self.get_queryset().filter(trabajador_id=trabajador_id)
            serializer = self.get_serializer(registros, many=True)
            return Response(serializer.data)
        return Response({"error": "Se requiere trabajador_id"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def por_rango_fechas(self, request):
        """Endpoint para obtener registros filtrados por rango de fechas"""
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        queryset = self.get_queryset()
        if fecha_inicio:
            queryset = queryset.filter(fecha_hora_inicio__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha_hora_inicio__lte=fecha_fin)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)