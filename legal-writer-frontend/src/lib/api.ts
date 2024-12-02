import { getAccessToken, isTokenExpired, refreshAccessToken, setTokens, clearTokens } from './auth';

const API_BASE_URL = 'http://localhost:8000/api';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
  skipContentType?: boolean;
}

interface APIError extends Error {
  status?: number;
  data?: any;
}

async function fetchWithAuth(endpoint: string, config: RequestConfig = {}) {
  const { requiresAuth = true, skipContentType = false, ...fetchConfig } = config;
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    // Handle authentication
    if (requiresAuth) {
      let accessToken = getAccessToken();
      
      if (!accessToken) {
        console.error('No access token found, redirecting to login');
        clearTokens();
        throw new Error('Authentication required');
      }

      // Check if token is expired and try to refresh
      if (isTokenExpired(accessToken)) {
        console.log('Access token expired, attempting refresh...');
        try {
          accessToken = await refreshAccessToken();
          console.log('Token refresh successful');
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          clearTokens();
          throw new Error('Session expired. Please log in again.');
        }
      }

      // Add authorization header
      fetchConfig.headers = {
        ...fetchConfig.headers,
        'Authorization': `Bearer ${accessToken}`,
      };
    }

    // Add content type header for JSON requests
    if (!skipContentType && !(fetchConfig.body instanceof FormData)) {
      fetchConfig.headers = {
        ...fetchConfig.headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
    }

    console.log('Making API request:', {
      url,
      method: fetchConfig.method || 'GET',
      headers: fetchConfig.headers,
      requiresAuth,
    });

    // Make the request
    const response = await fetch(url, {
      ...fetchConfig,
      credentials: 'include', // Always include credentials
    });

    console.log('Received response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    // Parse the response
    let responseData;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      console.log('Parsed response data:', responseData);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      responseData = null;
    }

    // Handle error responses
    if (!response.ok) {
      const error = new Error('API request failed') as APIError;
      error.status = response.status;
      error.data = responseData;

      // Handle specific status codes
      switch (response.status) {
        case 400:
          console.error('Bad request:', responseData);
          error.message = typeof responseData === 'object' ? 
            Object.values(responseData).flat().join(', ') : 
            responseData?.toString() || 'Invalid request data';
          break;
        case 401:
          console.error('Authentication failed');
          clearTokens();
          error.message = 'Authentication failed';
          break;
        case 403:
          console.error('Permission denied');
          error.message = 'Permission denied';
          break;
        case 404:
          console.error('Resource not found');
          error.message = 'Resource not found';
          break;
        default:
          console.error('API error:', response.status, responseData);
          error.message = 'An unexpected error occurred';
      }

      throw error;
    }

    return responseData;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    console.log('Attempting login...');
    const response = await fetchWithAuth('/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      requiresAuth: false,
    });
    
    if (response.access && response.refresh) {
      console.log('Login successful, setting tokens');
      setTokens(response.access, response.refresh);
    } else {
      console.error('Invalid login response:', response);
      throw new Error('Invalid login response from server');
    }
    
    return response;
  },

  // Projects
  getProjects: async () => {
    return await fetchWithAuth('/projects/');
  },

  getProject: async (id: number) => {
    return await fetchWithAuth(`/projects/${id}/`);
  },

  createProject: async (data: { title: string; description?: string }) => {
    return await fetchWithAuth('/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Documents
  getDocuments: async (projectId: number) => {
    return fetchWithAuth(`/documents/?project=${projectId}`);
  },

  getDocument: async (documentId: string) => {
    return await fetchWithAuth(`/documents/${documentId}/`);
  },

  createDocument: async (projectId: number, data: { title: string; content: string }) => {
    try {
      console.log('Creating document with data:', {
        projectId,
        title: data.title,
        content: data.content
      });

      const response = await fetchWithAuth('/documents/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: data.title || 'Untitled Document',
          content: data.content || '',
          project: projectId
        })
      });

      return response;
    } catch (error: any) {
      console.error('Document creation error:', {
        error,
        message: error.message,
        status: error.status,
        data: error.data
      });
      throw error;
    }
  },

  deleteDocument: async (projectId: number, documentId: number) => {
    const endpoint = `/documents/${documentId}/`;
    console.log('Making request to:', API_BASE_URL + endpoint);
    return await fetchWithAuth(endpoint, {
      method: 'DELETE',
    });
  },

  updateDocument: async (projectId: number, documentId: number, data: { title?: string; content?: string }) => {
    const endpoint = `/documents/${documentId}/`;
    console.log('Making request to:', API_BASE_URL + endpoint);
    return await fetchWithAuth(endpoint, {
      method: 'PATCH',
      body: JSON.stringify({ ...data, project: projectId }),
    });
  },

  // Notes
  createNote: async (data: { 
    content: string; 
    title: string; 
    name_identifier: string;
    project: number 
  }) => {
    console.log('Creating note with data:', data);
    const response = await fetchWithAuth('/notes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('Note creation response:', response);
    return response;
  },

  updateNote: async (noteId: number, data: {
    content?: string;
    title?: string;
    name_identifier?: string;
  }) => {
    return await fetchWithAuth(`/notes/${noteId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getNotes: async (projectId: number) => {
    const response = await fetchWithAuth(`/notes/?project=${projectId}`);
    console.log('Fetched notes:', response);
    return response;
  },

  deleteNote: async (noteId: number) => {
    return await fetchWithAuth(`/notes/${noteId}/`, {
      method: 'DELETE',
    });
  },

  // Resources
  getResources: async (projectId: number) => {
    return await fetchWithAuth(`/resources/?project=${projectId}`);
  },

  uploadResource: async (formData: FormData) => {
    return await fetchWithAuth('/resources/', {
      method: 'POST',
      body: formData,
      skipContentType: true,  // Important: Skip content-type for FormData
    });
  },

  extractResourceContent: async (resourceId: number) => {
    return await fetchWithAuth(`/resources/${resourceId}/extract/`, {
      method: 'POST',
    });
  },

  summarizeResource: async (resourceId: number) => {
    const response = await fetchWithAuth(`/resources/${resourceId}/summarize/`, {
      method: 'POST',
    });
    return response;
  },

  deleteResource: async (resourceId: number) => {
    return await fetchWithAuth(`/resources/${resourceId}/`, {
      method: 'DELETE',
    });
  },
};
