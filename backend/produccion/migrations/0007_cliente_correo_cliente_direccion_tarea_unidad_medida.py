from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('produccion', '0006_alter_registroproduccion_fecha_registro'),
    ]

    operations = [
        migrations.AddField(
            model_name='cliente',
            name='correo',
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name='cliente',
            name='direccion',
            field=models.CharField(blank=True, max_length=250),
        ),
        migrations.AddField(
            model_name='tarea',
            name='unidad_medida',
            field=models.CharField(blank=True, max_length=50),
        ),
    ]
