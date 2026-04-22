from django.urls import path
from . import views

urlpatterns = [
    path('maquinas/guardar/', views.guardar_maquina, name='guardar_maquina'),
    path('maquinas/eliminar/<int:id>/', views.eliminar_maquina, name='eliminar_maquina'),
]