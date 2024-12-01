import os
from PyPDF2 import PdfReader
import magic
import openai
from django.conf import settings
from asgiref.sync import sync_to_async

# Configure OpenAI with API key
openai.api_key = settings.OPENAI_API_KEY

def get_file_type(file_path):
    """Detect the file type using python-magic"""
    mime = magic.Magic(mime=True)
    file_type = mime.from_file(file_path)
    return file_type

def extract_text_from_pdf(file_path):
    """Extract text content from a PDF file"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Verify it's a PDF file
    file_type = get_file_type(file_path)
    if not file_type.lower().startswith('application/pdf'):
        raise ValueError(f"File is not a PDF: {file_type}")

    try:
        reader = PdfReader(file_path)
        text_content = []
        
        # Extract text from each page
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_content.append(text)
        
        return '\n\n'.join(text_content)
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
