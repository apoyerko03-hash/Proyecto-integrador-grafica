from rest_framework import serializers
from .models import Maquina

# Serializador para el modelo Maquina, expone todos sus campos
class MaquinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maquina
        fields = '__all__'