from django.db.models import Sum
from rest_framework import serializers

from .models import Cliente, OrdenTrabajo, RegistroProduccion, Tarea


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'


class TareaSerializer(serializers.ModelSerializer):
    orden_codigo = serializers.CharField(source='orden.codigo', read_only=True)
    produccion_real = serializers.SerializerMethodField()
    trabajador_asignado = serializers.SerializerMethodField()

    def validate(self, attrs):
        orden = attrs.get('orden') or getattr(self.instance, 'orden', None)
        orden_actual_id = getattr(getattr(self.instance, 'orden', None), 'id', None)
        orden_nueva_id = getattr(orden, 'id', None)
        es_creacion = self.instance is None
        cambia_orden = orden_actual_id != orden_nueva_id

        estado_orden = str(getattr(orden, 'estado', '')).strip().lower()
        orden_en_progreso = estado_orden in ['en progreso', 'en_proceso']

        if (es_creacion or cambia_orden) and orden and not orden_en_progreso:
            raise serializers.ValidationError({
                'orden': 'Solo se pueden agregar tareas a ordenes en estado En progreso.'
            })

        return attrs

    class Meta:
        model = Tarea
        fields = [
            'id',
            'orden',
            'orden_codigo',
            'nombre_tarea',
            'unidad_medida',
            'prod_esperada',
            'tiempo_estimado_horas',
            'produccion_real',
            'trabajador_asignado',
        ]

    def get_produccion_real(self, obj):
        return RegistroProduccion.objects.filter(tarea=obj).aggregate(
            total=Sum('cant_producida')
        )['total'] or 0

    def get_trabajador_asignado(self, obj):
        registro = RegistroProduccion.objects.select_related(
            'trabajador'
        ).filter(tarea=obj).order_by('-id').first()

        if not registro:
            return None

        return f'{registro.trabajador.nombres} {registro.trabajador.apellidos}'


class OrdenTrabajoSerializer(serializers.ModelSerializer):
    tareas = TareaSerializer(many=True, read_only=True)
    cliente = ClienteSerializer(read_only=True)
    progreso = serializers.SerializerMethodField()
    produccion_real_total = serializers.SerializerMethodField()
    produccion_esperada_total = serializers.SerializerMethodField()
    total_tareas = serializers.SerializerMethodField()
    tareas_completadas = serializers.SerializerMethodField()
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
            'tareas',
            'progreso',
            'produccion_real_total',
            'produccion_esperada_total',
            'total_tareas',
            'tareas_completadas',
        ]

    def validate_estado(self, value):
        estados = {
            'pendiente': 'Pendiente',
            'en progreso': 'En progreso',
            'en_proceso': 'En progreso',
            'completada': 'Completada',
            'completado': 'Completada',
            'finalizada': 'Completada',
        }
        return estados.get(str(value).strip().lower(), value)

    def get_produccion_real_total(self, obj):
        return RegistroProduccion.objects.filter(tarea__orden=obj).aggregate(
            total=Sum('cant_producida')
        )['total'] or 0

    def get_produccion_esperada_total(self, obj):
        return obj.tareas.aggregate(total=Sum('prod_esperada'))['total'] or 0

    def get_total_tareas(self, obj):
        return obj.tareas.count()

    def get_tareas_completadas(self, obj):
        total = 0
        for tarea in obj.tareas.all():
            producido = RegistroProduccion.objects.filter(tarea=tarea).aggregate(
                total=Sum('cant_producida')
            )['total'] or 0
            if tarea.prod_esperada and producido >= tarea.prod_esperada:
                total += 1
        return total

    def get_progreso(self, obj):
        esperado = self.get_produccion_esperada_total(obj)
        if not esperado:
            return 0

        real = self.get_produccion_real_total(obj)
        return round(min((real / esperado) * 100, 100), 2)


class RegistroProduccionSerializer(serializers.ModelSerializer):
    tarea = TareaSerializer(read_only=True)
    trabajador_nombre = serializers.SerializerMethodField()

    class Meta:
        model = RegistroProduccion
        fields = '__all__'

    def get_trabajador_nombre(self, obj):
        return f'{obj.trabajador.nombres} {obj.trabajador.apellidos}'


class RegistroProduccionCreateSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        cant_producida = float(attrs.get('cant_producida') or 0)
        tiempo_real_horas = float(attrs.get('tiempo_real_horas') or 0)

        if cant_producida < 0:
            raise serializers.ValidationError({
                'cant_producida': 'La cantidad producida no puede ser negativa.'
            })

        if tiempo_real_horas <= 0:
            raise serializers.ValidationError({
                'tiempo_real_horas': 'El tiempo real debe ser mayor a 0.'
            })

        return attrs

    def create(self, validated_data):
        validated_data['es_anomalia'] = self._detectar_anomalia(validated_data)
        return super().create(validated_data)

    def _detectar_anomalia(self, data):
        tarea = data.get('tarea')
        cant_producida = float(data.get('cant_producida') or 0)
        tiempo_real_horas = float(data.get('tiempo_real_horas') or 0)
        prod_esperada = float(tarea.prod_esperada or 0) if tarea else 0
        tiempo_estimado = float(tarea.tiempo_estimado_horas or 0) if tarea else 0

        if tiempo_real_horas <= 0 or prod_esperada <= 0:
            return True

        eficiencia = cant_producida / prod_esperada

        if eficiencia < 0.50 or eficiencia > 1.50:
            return True

        if tiempo_estimado > 0:
            produccion_hora_real = cant_producida / tiempo_real_horas
            produccion_hora_esperada = prod_esperada / tiempo_estimado

            if produccion_hora_esperada > 0:
                ratio_hora = produccion_hora_real / produccion_hora_esperada
                if ratio_hora < 0.50 or ratio_hora > 2.00:
                    return True

        registros_historicos = RegistroProduccion.objects.filter(
            tarea=tarea,
            tiempo_real_horas__gt=0,
        ).exclude(
            cant_producida__isnull=True
        ).values_list('cant_producida', 'tiempo_real_horas')

        tasas_historicas = [
            float(cantidad) / float(horas)
            for cantidad, horas in registros_historicos
            if float(horas or 0) > 0
        ]

        if len(tasas_historicas) >= 5:
            tasa_actual = cant_producida / tiempo_real_horas
            promedio = sum(tasas_historicas) / len(tasas_historicas)
            varianza = sum((tasa - promedio) ** 2 for tasa in tasas_historicas) / len(tasas_historicas)
            desviacion = varianza ** 0.5

            if desviacion > 0 and abs(tasa_actual - promedio) > (3 * desviacion):
                return True

        return False

    class Meta:
        model = RegistroProduccion
        fields = [
            'id',
            'tarea',
            'trabajador',
            'cant_producida',
            'tiempo_real_horas',
            'fecha_registro',
            'es_anomalia',
        ]
        read_only_fields = ['id', 'es_anomalia']
