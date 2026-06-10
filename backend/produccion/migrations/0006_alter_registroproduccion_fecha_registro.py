from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('produccion', '0005_registroproduccion_fecha_registro'),
    ]

    operations = [
        migrations.AlterField(
            model_name='registroproduccion',
            name='fecha_registro',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
