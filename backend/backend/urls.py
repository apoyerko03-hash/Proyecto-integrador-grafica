from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Desconecté0 la API vieja eventualmente, pero se a enrutado las nuevas:
    path('api/produccion/', include('produccion.urls')),
    path('api/analitica/', include('analitica.urls')),
]