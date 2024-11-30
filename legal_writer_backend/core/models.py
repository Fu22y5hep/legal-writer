from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class Document(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='document')
    content = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Document for {self.project.title}"

    class Meta:
        ordering = ['-created_at']

class Note(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='notes')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Note for {self.project.title} - {self.created_at.strftime('%Y-%m-%d')}"

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
    content_extracted = models.TextField(blank=True, null=True, help_text='Extracted text content from the file')
    extraction_error = models.TextField(blank=True, null=True, help_text='Any errors encountered during text extraction')
    last_extracted = models.DateTimeField(null=True, blank=True, help_text='When the content was last extracted')

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

    class Meta:
        ordering = ['-uploaded_at']
