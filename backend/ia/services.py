def detectar_anomalia(produccion_actual, promedio):
    """Detecta produccion anomala cuando cae por debajo del 60% del promedio."""
    if promedio <= 0:
        return True
    return produccion_actual < promedio * 0.6


def generar_recomendacion(anomalia=False):
    """Genera una recomendacion simple segun el resultado de anomalia."""
    if anomalia:
        return "Revisar productividad, tiempos reales y asignacion de recursos."
    return "Produccion dentro del rango normal."
