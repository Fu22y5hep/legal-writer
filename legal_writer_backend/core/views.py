from django.shortcuts import render
from rest_framework import viewsets, permissions, response
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.decorators import sync_and_async_middleware
from asgiref.sync import sync_to_async
from .models import Project, Document, Note, Resource
from .serializers import ProjectSerializer, DocumentSerializer, NoteSerializer, ResourceSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import serializers
import logging
import json

logger = logging.getLogger(__name__)

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

    def get_serializer_context(self):
        # Pass request to serializer for additional validation
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        # Detailed logging for document creation
        logger.info(f"Document creation request received")
        logger.info(f"Request user: {request.user}")
        
        # Log raw request data
        try:
            request_body = json.loads(request.body.decode('utf-8'))
            logger.info(f"Request body: {request_body}")
        except Exception as e:
            logger.error(f"Error parsing request body: {e}")
            request_body = request.data

        # Log request data
        logger.info(f"Request data: {request.data}")

        try:
            # Validate project ownership
            project_id = request.data.get('project')
            
            if not project_id:
                logger.error("No project ID provided")
                return Response(
                    {"project": "Project ID is required"}, 
                    status=400
                )

            try:
                project = Project.objects.get(id=project_id, owner=request.user)
                logger.info(f"Project found: {project}")
            except Project.DoesNotExist:
                logger.error(f"Project not found or unauthorized: {project_id}")
                return Response(
                    {"project": "Invalid project or unauthorized access"}, 
                    status=403
                )

            # Prepare serializer
            serializer = self.get_serializer(data=request.data)
            
            try:
                # Validate serializer
                serializer.is_valid(raise_exception=True)
                logger.info("Serializer validation passed")
            except serializers.ValidationError as e:
                logger.error(f"Validation error: {e}")
                return Response(e.detail, status=400)

            # Create the document
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            
            logger.info(f"Document created successfully: {serializer.data}")
            return Response(serializer.data, status=201, headers=headers)

        except Exception as e:
            # Catch-all for any unexpected errors
            logger.error(f"Unexpected error in document creation: {str(e)}", exc_info=True)
            return Response(
                {"detail": str(e)}, 
                status=500
            )

    def perform_create(self, serializer):
        # Validate project ownership
        project_id = self.request.data.get('project')
        try:
            project = Project.objects.get(id=project_id, owner=self.request.user)
            serializer.save(project=project)
        except Project.DoesNotExist:
            raise serializers.ValidationError({
                "project": "Invalid project or unauthorized access"
            })

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

    @action(detail=True, methods=['post'])
    def summarize(self, request, pk=None):
        """Endpoint to manually trigger content summarization"""
        resource = self.get_object()
        
        # Run the async summarization in a sync context
        async def async_summarize():
            await resource.summarize()
            return {
                'status': 'success',
                'summary': resource.summary or None,
                'summary_error': resource.summary_error or None,
                'last_summarized': resource.last_summarized
            }
        
        from asgiref.sync import async_to_sync
        result = async_to_sync(async_summarize)()
        return Response(result)
