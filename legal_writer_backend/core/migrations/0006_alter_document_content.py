# Generated by Django 4.2.5 on 2024-11-30 05:57

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0005_remove_document_title_alter_document_content_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="document",
            name="content",
            field=models.TextField(blank=True, default=""),
        ),
    ]
