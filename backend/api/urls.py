from django.urls import path
from . import views

urlpatterns = [
    #/api/rendimiento/
    path('rendimiento/', views.get_rendimiento_maquina, name='rendimiento_maquina'),
]   