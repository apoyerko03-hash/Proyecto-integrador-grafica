from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import Rol, Trabajador
from .serializers import RolSerializer, TrabajadorSerializer, TrabajadorCreateSerializer, UserSerializer
from django.contrib.auth.models import User
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

# ViewSet para manejar las operaciones CRUD de los Roles
class RolViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar roles
    """
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    authentication_classes = [TokenAuthentication] # Requiere token para acceder
    permission_classes = [IsAuthenticated] # Solo usuarios autenticados
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nombre'] # Permite buscar por nombre
    ordering_fields = ['nombre', 'id']
    ordering = ['nombre']

# ViewSet para gestionar los perfiles de los trabajadores
class TrabajadorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar trabajadores
    """
    # Optimiza la consulta cargando los modelos relacionados user y rol
    queryset = Trabajador.objects.select_related('user', 'rol').all()
    serializer_class = TrabajadorSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'user__username']
    ordering_fields = ['user__first_name', 'user__last_name']
    ordering = ['user__first_name', 'user__last_name']

    # Cambia el serializador dependiendo de la acción (crear usa uno especial)
    def get_serializer_class(self):
        if self.action == 'create':
            return TrabajadorCreateSerializer
        return TrabajadorSerializer

    # Acción personalizada para listar solo trabajadores activos
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """Endpoint para obtener solo trabajadores activos"""
        activos = self.get_queryset().filter(estado=True)
        serializer = self.get_serializer(activos, many=True)
        return Response(serializer.data)

    # Acción personalizada para alternar el estado activo/inactivo de un trabajador
    @action(detail=True, methods=['post'])
    def toggle_activo(self, request, pk=None):
        """Endpoint para activar/desactivar un trabajador"""
        trabajador = self.get_object()
        trabajador.estado = not trabajador.estado
        trabajador.save()
        serializer = self.get_serializer(trabajador)
        return Response(serializer.data)

# ViewSet para listar usuarios de Django, limitado a lectura por seguridad
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para usuarios (para evitar modificar datos sensibles directamente)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'date_joined']
    ordering = ['username']

    # Acción personalizada para obtener la información del usuario que está logueado
    @action(detail=False, methods=['get'])
    def perfil(self, request):
        """Endpoint para obtener el perfil del usuario autenticado"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

# Vista personalizada para el login que devuelve el token y datos básicos del usuario
class CustomAuthToken(ObtainAuthToken):
    """
    Vista personalizada para obtener token de autenticación
    """
    def post(self, request, *args, **kwargs):
        # Valida las credenciales enviadas
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        # Obtiene el token existente o crea uno nuevo para el usuario
        token, created = Token.objects.get_or_create(user=user)
        # Responde con el token y metadatos del usuario para el frontend
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name
        })