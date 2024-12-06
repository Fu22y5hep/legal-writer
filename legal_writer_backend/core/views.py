from django.shortcuts import render
from rest_framework import viewsets, permissions, response
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.decorators import sync_and_async_middleware
from asgiref.sync import sync_to_async
from .models import Project, Document, Note, Resource, ChatSession, ChatContext
from .serializers import ProjectSerializer, DocumentSerializer, NoteSerializer, ResourceSerializer, ChatSessionSerializer, ChatContextSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import serializers
import logging
import json
from rest_framework import status

logger = logging.getLogger(__name__)

# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['GET'])
    def available_contexts(self, request, pk=None):
        """
        Get available contexts (notes, documents, resources) for a project
        """
        try:
            project = self.get_object()
            
            # Get all notes, documents, and resources for the project
            notes = Note.objects.filter(project=project).values('id', 'title', 'content')
            documents = Document.objects.filter(project=project).values('id', 'title', 'content')
            resources = Resource.objects.filter(project=project).values('id', 'title', 'content_extracted')

            # Format the response
            contexts = []
            
            for note in notes:
                contexts.append({
                    'id': f"note_{note['id']}",
                    'type': 'NOTE',
                    'title': note['title'],
                    'content': note['content']
                })
                
            for doc in documents:
                contexts.append({
                    'id': f"doc_{doc['id']}",
                    'type': 'DOCUMENT',
                    'title': doc['title'],
                    'content': doc['content']
                })
                
            for resource in resources:
                contexts.append({
                    'id': f"resource_{resource['id']}",
                    'type': 'RESOURCE',
                    'title': resource['title'],
                    'content': resource['content_extracted']
                })

            return Response(contexts)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        queryset = Document.objects.filter(project__owner=self.request.user)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

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
        project_id = self.request.query_params.get('project')
        queryset = Note.objects.filter(project__owner=self.request.user)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

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

class ChatSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        queryset = ChatSession.objects.filter(project__owner=self.request.user)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class ChatContextViewSet(viewsets.ModelViewSet):
    serializer_class = ChatContextSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        chat_session_id = self.request.query_params.get('chat_session')
        queryset = ChatContext.objects.filter(chat_session__project__owner=self.request.user)
        if chat_session_id:
            queryset = queryset.filter(chat_session_id=chat_session_id)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import openai
import logging
import time
from functools import wraps

logger = logging.getLogger(__name__)

def retry_on_rate_limit(max_retries=3, initial_delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            delay = initial_delay
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except openai.error.RateLimitError as e:
                    if attempt == max_retries - 1:  # Last attempt
                        raise  # Re-raise the exception if we're out of retries
                    logger.warning(f"Rate limit hit, attempt {attempt + 1}/{max_retries}. Waiting {delay} seconds...")
                    time.sleep(delay)
                    delay *= 2  # Exponential backoff
            return func(*args, **kwargs)  # Final attempt
        return wrapper
    return decorator

class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    @retry_on_rate_limit(max_retries=3, initial_delay=1)
    def _call_openai(self, messages):
        return openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=2000,
            presence_penalty=0.6
        )

    def post(self, request):
        message = request.data.get('message')
        contexts = request.data.get('contexts', [])

        if not message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not settings.OPENAI_API_KEY:
            logger.error("OpenAI API key not configured")
            return Response(
                {'error': 'OpenAI API key not configured'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            # Configure OpenAI
            openai.api_key = settings.OPENAI_API_KEY

            # Format the context information for the LLM
            context_text = ""
            for ctx in contexts:
                context_text += f"\nContext ({ctx['type']} - {ctx['title']}):\n{ctx['content']}\n"

            # Prepare the messages for the LLM
            messages = []
            
            # Add system message with context if available
            if context_text:
                messages.append({
                    "role": "system",
                    "content": f"You are a helpful legal writing assistant. Use the following context to help answer the user's questions:{context_text}"
                })
            else:
                messages.append({
                    "role": "system",
                    "content": "You are a helpful legal writing assistant."
                })

            # Add the user's message
            messages.append({
                "role": "user",
                "content": message
            })

            logger.info(f"Sending request to OpenAI with {len(messages)} messages")
            
            # Call OpenAI API with retry logic
            response = self._call_openai(messages)

            logger.info("Successfully received response from OpenAI")
            logger.info(f"Response: {response}")

            # Extract the message content
            if response and response.choices and len(response.choices) > 0:
                message_content = response.choices[0].message.content
                return Response({
                    'content': message_content
                })
            else:
                logger.error("Invalid response format from OpenAI")
                return Response(
                    {'error': 'Invalid response from OpenAI'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except openai.error.RateLimitError as e:
            logger.warning(f"OpenAI rate limit exceeded after retries: {str(e)}")
            return Response(
                {'error': 'Our AI service is currently experiencing high demand. Please try again in a few minutes.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        except openai.error.AuthenticationError as e:
            logger.error(f"OpenAI authentication error: {str(e)}")
            return Response(
                {'error': 'Failed to authenticate with AI service'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except openai.error.APIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return Response(
                {'error': 'AI service error occurred'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Unexpected error in chat endpoint: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
