# Generated by Django 4.2.5 on 2024-12-06 03:21

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0004_chatsession_chatcontext"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="status",
            field=models.CharField(
                choices=[
                    ("ACTIVE", "Active"),
                    ("ARCHIVED", "Archived"),
                    ("DELETED", "Deleted"),
                ],
                default="ACTIVE",
                max_length=20,
            ),
        ),
    ]
