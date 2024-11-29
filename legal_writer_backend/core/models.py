from django.db import models
from django.contrib.auth.models import User

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
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Note for {self.project.title} - {self.created_at}"

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
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='resources/')
    file_type = models.CharField(max_length=10, choices=RESOURCE_TYPES)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)
    file_size = models.PositiveIntegerField(help_text='File size in bytes')
    content_extracted = models.TextField(blank=True, help_text='Extracted text content from the file')

    def __str__(self):
        return f"{self.title} ({self.file_type})"

    class Meta:
        ordering = ['-uploaded_at']
