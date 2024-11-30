from django.contrib import admin
from .models import Project, Document, Note, Resource

# Register your models here.

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'created_at', 'updated_at')
    list_filter = ('owner', 'created_at')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'created_at', 'updated_at')
    list_filter = ('project', 'created_at')
    search_fields = ('title', 'content')
    ordering = ('-created_at',)

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('project', 'created_at', 'updated_at')
    list_filter = ('project', 'created_at')
    search_fields = ('content',)
    ordering = ('-created_at',)

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'file_type', 'uploaded_at')
    list_filter = ('project', 'file_type', 'uploaded_at')
    search_fields = ('title', 'description')
    ordering = ('-uploaded_at',)
