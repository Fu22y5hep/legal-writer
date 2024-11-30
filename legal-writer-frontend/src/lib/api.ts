import { getAccessToken, isTokenExpired, refreshAccessToken } from './auth';

const API_BASE_URL = 'http://localhost:8000/api';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
  skipContentType?: boolean;
}

async function fetchWithAuth(endpoint: string, config: RequestConfig = {}) {
  const { requiresAuth = true, skipContentType = false, ...fetchConfig } = config;
  const url = `${API_BASE_URL}${endpoint}`;

  if (requiresAuth) {
    let accessToken = getAccessToken();

    if (accessToken && isTokenExpired(accessToken)) {
      accessToken = await refreshAccessToken();
    }

    if (!accessToken) {
      throw new Error('No access token available');
    }

    fetchConfig.headers = {
      ...fetchConfig.headers,
      'Authorization': `Bearer ${accessToken}`,
    };
  }

  if (!skipContentType) {
    fetchConfig.headers = {
      'Content-Type': 'application/json',
      ...fetchConfig.headers,
    };
  }

  try {
    const response = await fetch(url, fetchConfig);
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorData;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = await response.text();
        }
      } catch (parseError) {
        errorData = 'Could not parse error response';
      }
      
      console.error('API request failed:', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        errorData,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      throw new Error(
        typeof errorData === 'object' ? 
          JSON.stringify(errorData) : 
          `HTTP error! status: ${response.status} - ${errorData}`
      );
    }
    
    // For DELETE requests, return undefined as there's no content
    if (response.status === 204) {
      return undefined;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed with exception:', {
      endpoint,
      error,
      config: {
        method: fetchConfig.method,
        headers: fetchConfig.headers,
        body: fetchConfig.body instanceof FormData ? 
          Object.fromEntries(fetchConfig.body.entries()) : 
          fetchConfig.body,
      },
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    return await fetchWithAuth('/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      requiresAuth: false,
    });
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
  getDocuments: async (projectId?: number) => {
    const endpoint = projectId ? `/projects/${projectId}/documents/` : '/documents/';
    return await fetchWithAuth(endpoint);
  },

  createDocument: async (data: { title: string; content: string; project: number }) => {
    return await fetchWithAuth('/documents/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Notes
  getNotes: async (projectId: number) => {
    return await fetchWithAuth(`/notes/?project=${projectId}`);
  },

  createNote: async (data: { content: string; project: number }) => {
    return await fetchWithAuth('/notes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
      skipContentType: true,
    });
  },

  extractResourceContent: async (resourceId: number) => {
    return await fetchWithAuth(`/resources/${resourceId}/extract/`, {
      method: 'POST',
    });
  },

  deleteResource: async (resourceId: number) => {
    return await fetchWithAuth(`/resources/${resourceId}/`, {
      method: 'DELETE',
    });
  },
};
