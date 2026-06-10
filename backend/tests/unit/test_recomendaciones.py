from ia.services import generar_recomendacion


def test_generar_recomendacion_con_anomalia_devuelve_recomendacion():
    recomendacion = generar_recomendacion(anomalia=True)

    assert isinstance(recomendacion, str)
    assert recomendacion
    assert "revis" in recomendacion.lower() or "recomend" in recomendacion.lower()


def test_generar_recomendacion_sin_anomalia_devuelve_mensaje_normal():
    recomendacion = generar_recomendacion(anomalia=False)

    assert isinstance(recomendacion, str)
    assert recomendacion
    assert "normal" in recomendacion.lower()
