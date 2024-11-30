from django.shortcuts import render
from rest_framework import viewsets, permissions, response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
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
        project_id = self.request.query_params.get('project')
        queryset = Resource.objects.filter(project__owner=self.request.user)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        # Get the project and verify ownership
        project_id = self.request.data.get('project')
        project = Project.objects.get(id=project_id, owner=self.request.user)
        
        # Get the file size from the uploaded file
        file = self.request.FILES.get('file')
        if file:
            file_size = file.size
        else:
            file_size = 0

        # Save the resource
        resource = serializer.save(project=project, file_size=file_size)
        
        # Extract content if it's a PDF
        if resource.file_type == 'PDF':
            resource.extract_content()

    @action(detail=True, methods=['post'])
    def extract(self, request, pk=None):
        """Endpoint to manually trigger content extraction"""
        resource = self.get_object()
        resource.extract_content()
        return Response({
            'status': 'success',
            'content_extracted': bool(resource.content_extracted),
            'extraction_error': resource.extraction_error or None,
            'last_extracted': resource.last_extracted
        })

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def project_document(request, project_id):
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=404)

    # Get or create the document
    document, created = Document.objects.get_or_create(project=project)

    if request.method == 'GET':
        serializer = DocumentSerializer(document)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data
        if isinstance(data, str):
            data = {'content': data}
        serializer = DocumentSerializer(document, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
