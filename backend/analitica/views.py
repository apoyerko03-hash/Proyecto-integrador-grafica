import random
import time
from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd
from sklearn.ensemble import IsolationForest
from .models import Maquina

@api_view(['GET'])
def get_rendimiento_maquina(request):
    ahora = int(time.time())
    
    temperaturas = [random.uniform(68, 72) for _ in range(20)]
    vibraciones = [random.uniform(1.8, 2.2) for _ in range(20)]

    simular_fallo = request.GET.get('fallo', 'false') == 'true'
    
    if simular_fallo:
        temperaturas[-1] = random.uniform(105, 115) 
        vibraciones[-1] = random.uniform(5.5, 6.5)

    df = pd.DataFrame({
        'hora': [time.strftime('%H:%M:%S', time.localtime(ahora - (19 - i))) for i in range(20)],
        'temperatura': temperaturas,
        'vibracion': vibraciones
    })
    
    modelo = IsolationForest(contamination=0.1, random_state=42)
    df['anomalia'] = modelo.fit_predict(df[['temperatura', 'vibracion']])
    
    ultimo_registro = df.iloc[-1]
    hay_problema_ahora = ultimo_registro['anomalia'] == -1

    return Response({
        "status": "success",
        "maquina": "Mezcladora de Concreto 3000",
        "ultimas_lecturas": df.to_dict(orient='records'),
        "alertas_ia": df[df['anomalia'] == -1].to_dict(orient='records'),
        "hay_anomalia_actual": bool(hay_problema_ahora)
    })


@api_view(['POST', 'PUT'])
def guardar_maquina(request):
    data = request.data
    maquina_id = data.get('id')

    if maquina_id:
        try:
            maquina = Maquina.objects.get(id=maquina_id)
            maquina.nombre = data.get('nombre', maquina.nombre)
            maquina.tipo = data.get('tipo', maquina.tipo)
            maquina.estado = data.get('estado', maquina.estado)
            maquina.save()
            return Response({"mensaje": "Máquina actualizada", "id": maquina.id})
        except Maquina.DoesNotExist:
            return Response({"error": "Máquina no encontrada"}, status=404)
    else:
        maquina = Maquina.objects.create(
            nombre=data.get('nombre'),
            tipo=data.get('tipo'),
            estado=data.get('estado', 'activo')
        )
        return Response({"mensaje": "Máquina creada", "id": maquina.id}, status=201)


@api_view(['DELETE'])
def eliminar_maquina(request, id):
    try:
        maquina = Maquina.objects.get(id=id)
        maquina.delete()
        return Response({"mensaje": "Máquina eliminada"})
    except Maquina.DoesNotExist:
        return Response({"error": "Máquina no encontrada"}, status=404)
