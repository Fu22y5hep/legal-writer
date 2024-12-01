import { getAccessToken, isTokenExpired, refreshAccessToken, setTokens } from './auth';

const API_BASE_URL = 'http://localhost:8000/api';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
  skipContentType?: boolean;
}

async function fetchWithAuth(endpoint: string, config: RequestConfig = {}) {
  const { requiresAuth = true, skipContentType = false, ...fetchConfig } = config;
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    console.log(`Making API request to: ${url}`, {
      method: fetchConfig.method || 'GET',
      requiresAuth,
      skipContentType
    });

    if (requiresAuth) {
      let accessToken = getAccessToken();
      if (isTokenExpired(accessToken)) {
        accessToken = await refreshAccessToken();
      }
      fetchConfig.headers = {
        ...fetchConfig.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }

    // Don't set Content-Type for FormData
    if (!skipContentType && !(fetchConfig.body instanceof FormData)) {
      fetchConfig.headers = {
        ...fetchConfig.headers,
        'Content-Type': 'application/json',
      };
    }

    const response = await fetch(url, fetchConfig);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData
      });
      
      throw new Error(
        `API Error (${response.status}): ${errorData || response.statusText}`
      );
    }

    // Check if the response has content before trying to parse it
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response;
  } catch (error) {
    console.error('API Request Failed:', {
      url,
      method: fetchConfig.method,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const response = await fetchWithAuth('/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      requiresAuth: false,
    });
    
    if (response.access && response.refresh) {
      setTokens(response.access, response.refresh);
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
