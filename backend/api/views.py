import random
import time
from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd
from sklearn.ensemble import IsolationForest

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