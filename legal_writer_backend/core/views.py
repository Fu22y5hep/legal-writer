from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Project, Document, Note, Resource
from .serializers import ProjectSerializer, DocumentSerializer, NoteSerializer, ResourceSerializer
from rest_framework.parsers import MultiPartParser, FormParser

# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(project__owner=self.request.user)

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(project__owner=self.request.user)

class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Resource.objects.filter(project__owner=self.request.user)

    def perform_create(self, serializer):
        # You might want to add file size calculation here
        serializer.save()
