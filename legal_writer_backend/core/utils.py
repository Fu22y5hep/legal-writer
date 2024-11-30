import os
from PyPDF2 import PdfReader
import magic

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
