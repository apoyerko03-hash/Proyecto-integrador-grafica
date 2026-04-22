from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Maquina, Trabajador, OrdenTrabajo
from .serializers import TrabajadorSerializer, OrdenTrabajoSerializer


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
@api_view(['GET'])
def obtener_trabajadores(request):
    # Obtenemos tsodos los trabajadores de SQL Server ordenados por rendimiento (de mayor a menor)
    trabajadores = Trabajador.objects.all().order_by('-rendimiento')
    # c traduce
    serializer = TrabajadorSerializer(trabajadores, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def obtener_ordenes(request):
    # Obtenemos las órdenes de trabajo más recientes
    ordenes = OrdenTrabajo.objects.all().order_by('-fecha_creacion')
    serializer = OrdenTrabajoSerializer(ordenes, many=True)
    return Response(serializer.data)