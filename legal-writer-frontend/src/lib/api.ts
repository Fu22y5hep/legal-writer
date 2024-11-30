import { getAccessToken, isTokenExpired, refreshAccessToken } from './auth';

const API_BASE_URL = 'http://localhost:8000';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
  skipContentType?: boolean;
}

interface ApiError extends Error {
  status?: number;
  data?: any;
}

async function fetchWithAuth(endpoint: string, config: RequestConfig = {}) {
  const { requiresAuth = true, skipContentType = false, ...fetchConfig } = config;
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  try {
    if (requiresAuth) {
      let accessToken = getAccessToken();
      
      if (!accessToken) {
        const error = new Error('No access token available') as ApiError;
        error.status = 401;
        throw error;
      }

      if (isTokenExpired(accessToken)) {
        try {
          accessToken = await refreshAccessToken();
        } catch (refreshError) {
          const error = new Error('Session expired. Please login again.') as ApiError;
          error.status = 401;
          throw error;
        }
      }

      fetchConfig.headers = {
        ...(!skipContentType && { 'Content-Type': 'application/json' }),
        'Authorization': `Bearer ${accessToken}`,
        ...fetchConfig.headers,
      };
    } else {
      fetchConfig.headers = {
        ...(!skipContentType && { 'Content-Type': 'application/json' }),
        ...fetchConfig.headers,
      };
    }

    const response = await fetch(url, fetchConfig);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }

      const error = new Error(errorData.detail || 'An error occurred') as ApiError;
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error('API request failed:', {
        endpoint,
        error: {
          message: error.message,
          status: (error as ApiError).status,
          data: (error as ApiError).data
        }
      });
    }
    throw error;
  }
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    return await fetchWithAuth('/token/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requiresAuth: false,
    });
  },

  refreshToken: async (refreshToken: string) => {
    return await fetchWithAuth('/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
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

  updateProject: async (id: number, data: { title?: string; description?: string }) => {
    return await fetchWithAuth(`/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Documents
  getProjectDocument: async (projectId: number) => {
    return await fetchWithAuth(`/projects/${projectId}/document/`);
  },

  saveProjectDocument: async (projectId: number, content: string) => {
    return await fetchWithAuth(`/projects/${projectId}/document/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Notes
  getNotes: async (projectId: number) => {
    return await fetchWithAuth(`/notes/?project=${projectId}`);
  },

  createNote: async (data: { project: number; content: string }) => {
    return await fetchWithAuth('/notes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Resources
  getResources: async (projectId: number) => {
    return await fetchWithAuth(`/resources/?project=${projectId}`);
  },

  uploadResource: async (projectId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project', projectId.toString());

    return await fetchWithAuth('/resources/', {
      method: 'POST',
      body: formData,
      skipContentType: true,
    });
  },

  extractResourceContent: async (resourceId: number) => {
    return await fetchWithAuth(`/resources/${resourceId}/extract_content/`, {
      method: 'POST'
    });
  }
};
