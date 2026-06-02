from rest_framework import serializers
from .models import Rol, Trabajador
from django.contrib.auth.models import User

# serializer es un componente encargado de traducir datos complejos (como los registros o instancias de
# bases de datos) a formatos nativos de Python. Esto permite que luego puedan renderizarse fácilmente
# a formatos como JSON o XML, lo cual es vital para crear APIs

# Serializador para el modelo User de Django, selecciona campos específicos para el frontend
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

# Serializador para el modelo Rol, expone el ID y el nombre
class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre']

# Serializador principal para Trabajador, incluye datos anidados de User y Rol
class TrabajadorSerializer(serializers.ModelSerializer):
    # Campos de solo lectura que muestran la información completa del usuario y rol
    user = UserSerializer(read_only=True)
    rol = RolSerializer(read_only=True)
    # Campo de solo escritura para poder asignar un rol por su ID al crear/actualizar
    rol_id = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(), source='rol', write_only=True
    )
    
    class Meta:
        model = Trabajador
        fields = ['id', 'user', 'rol', 'rol_id', 'nombres', 'apellidos', 'correo', 'estado']
        read_only_fields = ['id']

# Serializador específico para la creación de trabajadores, gestiona la creación simultánea de User y Trabajador
class TrabajadorCreateSerializer(serializers.ModelSerializer):
    """Serializer específico para crear trabajadores"""
    user = UserSerializer()
    rol_id = serializers.PrimaryKeyRelatedField(queryset=Rol.objects.all(), source='rol')
    
    class Meta:
        model = Trabajador
        fields = ['user', 'rol_id', 'nombres', 'apellidos', 'correo']
    
    # Lógica personalizada para crear el usuario y luego asociarlo al trabajador
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        # Crea el usuario de Django con el método create_user (maneja el hashing de contraseña)
        user = User.objects.create_user(**user_data)
        # Crea el perfil del trabajador asociado al usuario creado
        trabajador = Trabajador.objects.create(user=user, **validated_data)
        return trabajador