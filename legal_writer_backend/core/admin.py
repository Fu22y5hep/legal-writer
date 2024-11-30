from django.contrib import admin
from .models import Project, Document, Note, Resource

# Register your models here.

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'created_at', 'updated_at')
    search_fields = ('title', 'description')
    list_filter = ('created_at', 'updated_at', 'owner')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('project', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    raw_id_fields = ('project',)

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('project', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('content',)
    raw_id_fields = ('project',)

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('file', 'project', 'file_type', 'uploaded_at')
    list_filter = ('uploaded_at', 'file_type')
    search_fields = ('file',)
    raw_id_fields = ('project',)
