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
  console.log('Making request to:', url);

  try {
    let headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...fetchConfig.headers,
    };

    if (requiresAuth) {
      let accessToken = getAccessToken();
      
      if (!accessToken) {
        console.error('No access token found');
        throw new Error('Authentication required');
      }

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

      headers = {
        ...headers,
        'Authorization': `Bearer ${accessToken}`,
      };
    }

    const response = await fetch(url, {
      ...fetchConfig,
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    let data;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      console.log('Response data:', data);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      data = null;
    }

    return data;
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
    console.log('Fetching projects...');
    return fetchWithAuth('/projects/');
  },

  getProject: async (id: number) => {
    return fetchWithAuth(`/projects/${id}/`);
  },

  createProject: async (data: { title: string; description?: string }) => {
    return fetchWithAuth('/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Documents
  getDocuments: async (projectId: number) => {
    console.log('Fetching documents for project:', projectId);
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
    console.log('Fetching notes for project:', projectId);
    return fetchWithAuth(`/notes/?project=${projectId}`);
  },

  deleteNote: async (noteId: number) => {
    return await fetchWithAuth(`/notes/${noteId}/`, {
      method: 'DELETE',
    });
  },

  // Resources
  getResources: async (projectId: number) => {
    return await fetchWithAuth(`/projects/${projectId}/resources/`);
  },

  uploadResource: async (formData: FormData) => {
    return await fetchWithAuth('/resources/', {
      method: 'POST',
      body: formData,
      skipContentType: true,
    });
  },

  extractResourceContent: async (resourceId: number) => {
    return await fetchWithAuth(`/resources/${resourceId}/extract/`, {
      method: 'POST'
    });
  },

  summarizeResource: async (resourceId: number) => {
    const response = await fetchWithAuth(`/resources/${resourceId}/summarize/`, {
      method: 'POST'
    });
    return response;
  },

  deleteResource: async (resourceId: number) => {
    return await fetchWithAuth(`/resources/${resourceId}/`, {
      method: 'DELETE'
    });
  },

  // Chat Contexts
  getAvailableContexts: async (projectId: string) => {
    return fetchWithAuth(`/projects/${projectId}/available_contexts/`);
  },

  // Chat
  chat: async (message: string, contexts: Array<{ type: string; title: string; content: string }>) => {
    return fetchWithAuth('/chat/', {
      method: 'POST',
      body: JSON.stringify({
        message,
        contexts
      }),
    });
  },
};
