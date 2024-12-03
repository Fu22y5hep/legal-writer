import os
import pymupdf4llm
import magic
import openai
import re
from django.conf import settings
from asgiref.sync import sync_to_async

# Configure OpenAI with API key
openai.api_key = settings.OPENAI_API_KEY

def get_file_type(file_path):
    """Detect the file type using python-magic"""
    mime = magic.Magic(mime=True)
    file_type = mime.from_file(file_path)
    return file_type

def format_markdown_text(text):
    """Format markdown text for better readability"""
    # Remove multiple consecutive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Add proper spacing around headers
    text = re.sub(r'(#{1,6}.*?)\n', r'\1\n\n', text)
    
    # Add proper spacing around lists
    text = re.sub(r'(\n- .*?\n)(?!\n)', r'\1\n', text)
    
    # Add proper spacing around code blocks
    text = re.sub(r'(```.*?```)', r'\n\1\n', text, flags=re.DOTALL)
    
    # Format tables for better readability
    lines = text.split('\n')
    formatted_lines = []
    in_table = False
    
    for line in lines:
        if '|' in line:
            if not in_table:
                formatted_lines.append('')  # Add space before table
                in_table = True
            formatted_lines.append(line)
            if line.strip().startswith('|---'):  # Table header separator
                formatted_lines.append('')  # Add space after header
        else:
            if in_table:
                formatted_lines.append('')  # Add space after table
                in_table = False
            formatted_lines.append(line)
    
    text = '\n'.join(formatted_lines)
    
    # Add proper spacing around blockquotes
    text = re.sub(r'(\n>.*?\n)(?!\n)', r'\1\n', text)
    
    # Clean up any remaining multiple blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Ensure consistent heading hierarchy
    lines = text.split('\n')
    min_heading_level = 6
    for line in lines:
        if line.startswith('#'):
            level = len(re.match(r'^#+', line).group())
            min_heading_level = min(min_heading_level, level)
    
    if min_heading_level > 1:
        # Adjust heading levels to start from h1
        text = re.sub(r'^(#+)', lambda m: '#' * (len(m.group(1)) - min_heading_level + 1), text, flags=re.MULTILINE)
    
    return text.strip()

def extract_text_from_pdf(file_path):
    """Extract text content from a PDF file using pymupdf4llm"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Verify it's a PDF file
    file_type = get_file_type(file_path)
    if not file_type.lower().startswith('application/pdf'):
        raise ValueError(f"File is not a PDF: {file_type}")

    try:
        # Convert PDF to markdown using pymupdf4llm
        md_text = pymupdf4llm.to_markdown(file_path)
        
        # Format the markdown text for better readability
        formatted_text = format_markdown_text(md_text)
        
        return formatted_text
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

async def summarize_text(text: str) -> str:
    """Generate a summary of the text using gpt-4o-mini model"""
    if not text:
        raise ValueError("No text provided for summarization")

    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a legal document summarizer. Create a clear, concise summary of the provided text in simple paragraph format. Do not use any special formatting, bullets, numbering, or markdown. Focus on the key points and important details, presenting them in a flowing narrative."
                },
                {
                    "role": "user", 
                    "content": f"Please summarize the following text in a clear paragraph format:\n\n{text}"
                }
            ],
            max_tokens=500,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Error generating summary: {str(e)}")
