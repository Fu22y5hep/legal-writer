import { getAccessToken, isTokenExpired, refreshAccessToken } from './auth';

const API_BASE_URL = 'http://localhost:8000/api';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

async function fetchWithAuth(endpoint: string, config: RequestConfig = {}) {
  const { requiresAuth = true, ...fetchConfig } = config;
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

  fetchConfig.headers = {
    'Content-Type': 'application/json',
    ...fetchConfig.headers,
  };

  try {
    const response = await fetch(url, fetchConfig);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
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
    return await fetchWithAuth(`/projects/${projectId}/notes/`);
  },

  createNote: async (data: { content: string; project: number }) => {
    return await fetchWithAuth('/notes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Resources
  uploadResource: async (formData: FormData) => {
    return await fetchWithAuth('/resources/', {
      method: 'POST',
      headers: {
        // Don't set Content-Type here, let the browser set it with the boundary
      },
      body: formData,
    });
  },
};
