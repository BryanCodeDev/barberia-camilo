const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

let authToken = localStorage.getItem('admin_token');

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('admin_token', token);
  } else {
    localStorage.removeItem('admin_token');
  }
};

export const getAuthToken = () => authToken;

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.error || data.message || `Error ${response.status}`);
      err.data = data;
      throw err;
    }
    return data;
  }
  if (!response.ok) {
    throw new Error(`Error ${response.status}`);
  }
  return response.text();
};

export const api = {
  get: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  post: async (url, body) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  patch: async (url, body) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};
