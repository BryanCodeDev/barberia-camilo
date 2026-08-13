const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

let adminToken = localStorage.getItem('admin_token');
let clientToken = localStorage.getItem('client_token');

export const setAdminToken = (token) => {
  adminToken = token;
  if (token) {
    localStorage.setItem('admin_token', token);
  } else {
    localStorage.removeItem('admin_token');
  }
};

export const getAdminToken = () => adminToken;

export const setClientToken = (token) => {
  clientToken = token;
  if (token) {
    localStorage.setItem('client_token', token);
  } else {
    localStorage.removeItem('client_token');
  }
};

export const getClientToken = () => clientToken;

const getHeaders = (useClientToken = false) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = useClientToken ? clientToken : adminToken;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
  get: async (url, useClientToken = false) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: getHeaders(useClientToken),
    });
    return handleResponse(response);
  },

  post: async (url, body, useClientToken = false) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: getHeaders(useClientToken),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  patch: async (url, body, useClientToken = false) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: getHeaders(useClientToken),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (url, useClientToken = false) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(useClientToken),
    });
    return handleResponse(response);
  },
};
