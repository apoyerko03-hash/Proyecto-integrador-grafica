from rest_framework import serializers
from .models import Cliente, OrdenTrabajo, Tarea, RegistroProduccion
from usuarios.models import Trabajador

# Serializador básico para el modelo Cliente
class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

# Serializador básico para el modelo Tarea
class TareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarea
        fields = '__all__'

# Serializador para OrdenTrabajo, incluye tareas anidadas y datos del cliente
class OrdenTrabajoSerializer(serializers.ModelSerializer):
    # Relación anidada para mostrar las tareas de esta orden
    tareas = TareaSerializer(
        many=True,
        read_only=True
    )

    # Muestra los datos completos del cliente en GET
    cliente = ClienteSerializer(
        read_only=True
    )

    # Permite asignar un cliente por su ID en POST/PUT
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

# Serializador para mostrar los registros de producción con detalles adicionales
class RegistroProduccionSerializer(serializers.ModelSerializer):
    # Incluye detalles de la tarea asociada
    tarea = TareaSerializer(read_only=True)
    # Atajo para obtener el nombre completo del trabajador desde el modelo User
    trabajador_nombre = serializers.CharField(source='trabajador.user.get_full_name', read_only=True)
    
    class Meta:
        model = RegistroProduccion
        fields = '__all__'
        read_only_fields = ['fecha_registro']

# Serializador optimizado para la creación de nuevos registros de producción
class RegistroProduccionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroProduccion
        # Se mantienen los campos originales aunque algunos no estén en el modelo (según el código original)
        fields = ['tarea', 'trabajador', 'fecha_hora_inicio', 'fecha_hora_fin', 'cant_producida', 'tiempo_real_horas', 'observaciones']