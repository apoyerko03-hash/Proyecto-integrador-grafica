from rest_framework import serializers

# Serializador de datos de entrada para la petición de simulación
class SimulacionRequestSerializer(serializers.Serializer):
    orden_id = serializers.IntegerField() # ID de la orden que se desea proyectar
    cantidad_trabajadores = serializers.IntegerField(min_value=1) # Número de operarios que se asignarán
