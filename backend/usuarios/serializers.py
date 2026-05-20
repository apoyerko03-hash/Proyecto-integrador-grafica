from rest_framework import serializers
from .models import Rol, Trabajador
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre']


class TrabajadorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    rol = RolSerializer(read_only=True)
    rol_id = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(), source='rol', write_only=True
    )
    
    class Meta:
        model = Trabajador
        fields = ['id', 'user', 'rol', 'rol_id', 'nombres', 'apellidos', 'correo', 'estado']
        read_only_fields = ['id']


class TrabajadorCreateSerializer(serializers.ModelSerializer):
    """Serializer específico para crear trabajadores"""
    user = UserSerializer()
    rol_id = serializers.PrimaryKeyRelatedField(queryset=Rol.objects.all(), source='rol')
    
    class Meta:
        model = Trabajador
        fields = ['user', 'rol_id', 'nombres', 'apellidos', 'correo']
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        trabajador = Trabajador.objects.create(user=user, **validated_data)
        return trabajador