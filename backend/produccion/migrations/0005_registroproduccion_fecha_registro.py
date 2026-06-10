import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('produccion', '0004_ordentrabajo_descripcion_alter_cliente_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='registroproduccion',
            name='fecha_registro',
            field=models.DateTimeField(
                auto_now_add=True,
                default=django.utils.timezone.now
            ),
            preserve_default=False,
        ),
    ]
