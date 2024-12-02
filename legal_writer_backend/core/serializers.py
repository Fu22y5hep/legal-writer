from rest_framework import serializers
"""Provides classes for easily serializing complex data types into JSON or other content types."""
from .models import Project, Document, Note, Resource
from django.contrib.auth.models import User
import logging

logger = logging.getLogger('core')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = [
            'id', 'project', 'title', 'file', 'file_type', 'description',
            'file_size', 'uploaded_at', 'content_extracted', 'extraction_error',
            'last_extracted', 'summary', 'summary_error', 'last_summarized'
        ]
        read_only_fields = [
            'file_size', 'content_extracted', 'extraction_error', 'last_extracted',
            'summary', 'summary_error', 'last_summarized'
        ]

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'name_identifier', 'content', 'created_at', 'updated_at', 'project']
        read_only_fields = ['created_at', 'updated_at']

class DocumentSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), 
        required=True,
        error_messages={
            'null': 'Project is required',
            'does_not_exist': 'Invalid project'
        }
    )

    class Meta:
        model = Document
        fields = ['id', 'title', 'content', 'created_at', 'updated_at', 'project']
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'title': {
                'error_messages': {
                    'blank': 'Title cannot be empty',
                    'required': 'Title is required'
                }
            },
            'content': {
                'error_messages': {
                    'blank': 'Content cannot be empty',
                    'required': 'Content is required'
                }
            }
        }

    def validate(self, data):
        # Comprehensive validation with detailed logging
        logger.info(f"Validating document data: {data}")
        
        errors = {}

        # Validate project
        if 'project' not in data or not data['project']:
            logger.error("No project provided in document creation")
            errors['project'] = 'Project is required'
        
        # Validate title
        if 'title' not in data or not data['title']:
            logger.error("No title provided in document creation")
            errors['title'] = 'Title is required and cannot be empty'
        elif len(data['title']) > 200:
            logger.error(f"Title too long: {len(data['title'])} characters")
            errors['title'] = 'Title cannot be longer than 200 characters'
        
        # Validate content
        if 'content' not in data or not data['content']:
            logger.error("No content provided in document creation")
            errors['content'] = 'Content is required and cannot be empty'
        
        # Raise validation error if any errors found
        if errors:
            logger.error(f"Validation errors in document creation: {errors}")
            raise serializers.ValidationError(errors)
        
        return data

    def validate_project(self, project):
        # Additional project validation
        logger.info(f"Validating project: {project}")
        
        if not project:
            logger.error("Invalid project in document creation")
            raise serializers.ValidationError('Invalid project')
        
        # Optional: Check if user has permission to create document in this project
        request = self.context.get('request')
        if request and request.user != project.owner:
            logger.error(f"User {request.user} does not own project {project}")
            raise serializers.ValidationError('You do not have permission to create documents in this project')
        
        return project

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    notes = NoteSerializer(many=True, read_only=True)
    resources = ResourceSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'created_at', 'updated_at', 'owner', 'documents', 'notes', 'resources']
        read_only_fields = ['created_at', 'updated_at', 'owner']
