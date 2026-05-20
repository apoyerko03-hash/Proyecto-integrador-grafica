from rest_framework import serializers
from .models import Cliente, OrdenTrabajo, Tarea, RegistroProduccion
from usuarios.models import Trabajador


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'


class TareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarea
        fields = '__all__'


class OrdenTrabajoSerializer(serializers.ModelSerializer):

    tareas = TareaSerializer(
        many=True,
        read_only=True
    )

    cliente = ClienteSerializer(
        read_only=True
    )

    cliente_id = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.all(),
        source='cliente',
        write_only=True
    )

    class Meta:
        model = OrdenTrabajo

        fields = [
            'id',
            'codigo',
            'cliente',
            'cliente_id',
            'descripcion',
            'fecha_entrega',
            'estado',
            'tareas'
        ]


class RegistroProduccionSerializer(serializers.ModelSerializer):
    tarea = TareaSerializer(read_only=True)
    trabajador_nombre = serializers.CharField(source='trabajador.user.get_full_name', read_only=True)
    
    class Meta:
        model = RegistroProduccion
        fields = '__all__'
        read_only_fields = ['fecha_registro']


class RegistroProduccionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroProduccion
        fields = ['tarea', 'trabajador', 'fecha_hora_inicio', 'fecha_hora_fin', 'cant_producida', 'tiempo_real_horas', 'observaciones']