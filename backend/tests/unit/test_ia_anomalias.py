from ia.services import detectar_anomalia


def test_detectar_anomalia_devuelve_true_si_produccion_menor_al_60_por_ciento():
    assert detectar_anomalia(produccion_actual=50, promedio=100) is True


def test_detectar_anomalia_devuelve_false_si_esta_en_rango_normal():
    assert detectar_anomalia(produccion_actual=80, promedio=100) is False
