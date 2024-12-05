from django.db import models
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async

# Create your models here.

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class Document(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class Note(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=255, blank=True)
    name_identifier = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title if self.title else f"Note for {self.project.title} - {self.created_at}"

    class Meta:
        ordering = ['-created_at']

class Resource(models.Model):
    RESOURCE_TYPES = [
        ('PDF', 'PDF Document'),
        ('DOC', 'Word Document'),
        ('TXT', 'Text File'),
        ('OTHER', 'Other'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='resources/', max_length=255)
    file_type = models.CharField(max_length=10, choices=RESOURCE_TYPES)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)
    file_size = models.PositiveIntegerField(help_text='File size in bytes')
    content_extracted = models.TextField(blank=True, help_text='Extracted text content from the file')
    extraction_error = models.TextField(blank=True, help_text='Any errors encountered during text extraction')
    last_extracted = models.DateTimeField(null=True, blank=True, help_text='When the content was last extracted')
    summary = models.TextField(blank=True, help_text='AI-generated summary of the content')
    summary_error = models.TextField(blank=True, help_text='Any errors encountered during summarization')
    last_summarized = models.DateTimeField(null=True, blank=True, help_text='When the content was last summarized')

    def __str__(self):
        return f"{self.title} ({self.file_type})"

    def extract_content(self):
        """Extract content from the uploaded file"""
        from django.utils import timezone
        from .utils import extract_text_from_pdf, get_file_type
        import os

        if not self.file:
            return

        try:
            file_path = self.file.path
            file_type = get_file_type(file_path)

            if file_type.lower().startswith('application/pdf'):
                extracted_text = extract_text_from_pdf(file_path)
                self.content_extracted = extracted_text
                self.extraction_error = ''
            else:
                self.extraction_error = f'Unsupported file type: {file_type}'
                self.content_extracted = ''

        except Exception as e:
            self.extraction_error = str(e)
            self.content_extracted = ''
        
        self.last_extracted = timezone.now()
        self.save()

    async def summarize(self):
        """Generate a summary of the extracted content"""
        from django.utils import timezone
        from .utils import summarize_text

        if not self.content_extracted:
            # Run extract_content synchronously since it's a blocking operation
            self.extract_content()
            if not self.content_extracted:
                self.summary_error = "No content available for summarization"
                await sync_to_async(self.save)()
                return

        try:
            summary = await summarize_text(self.content_extracted)
            self.summary = summary
            self.summary_error = ''
        except Exception as e:
            self.summary_error = str(e)
            self.summary = ''
        
        self.last_summarized = timezone.now()
        await sync_to_async(self.save)()

    class Meta:
        ordering = ['-uploaded_at']

class ChatSession(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='chat_sessions')
    title = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Chat Session for {self.project.title} - {self.created_at}"

    class Meta:
        ordering = ['-created_at']

class ChatContext(models.Model):
    CONTEXT_TYPE_CHOICES = [
        ('NOTE', 'Note'),
        ('DOCUMENT', 'Document'),
        ('RESOURCE', 'Resource'),
    ]

    chat_session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='contexts')
    context_type = models.CharField(max_length=10, choices=CONTEXT_TYPE_CHOICES)
    note = models.ForeignKey(Note, on_delete=models.SET_NULL, null=True, blank=True)
    document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True)
    resource = models.ForeignKey(Resource, on_delete=models.SET_NULL, null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        context_item = self.note or self.document or self.resource
        return f"{self.context_type} context: {context_item}"

    def get_content(self):
        if self.context_type == 'NOTE' and self.note:
            return self.note.content
        elif self.context_type == 'DOCUMENT' and self.document:
            return self.document.content
        elif self.context_type == 'RESOURCE' and self.resource:
            return self.resource.content_extracted
        return ''

    class Meta:
        ordering = ['-added_at']
