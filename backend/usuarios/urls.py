from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RolViewSet, TrabajadorViewSet, UserViewSet, CustomAuthToken

router = DefaultRouter()
router.register(r'roles', RolViewSet)
router.register(r'trabajadores', TrabajadorViewSet)
router.register(r'usuarios', UserViewSet, basename='usuario')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomAuthToken.as_view(), name='auth_login'),
]