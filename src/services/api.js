const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const REQUEST_TIMEOUT = 30000;

export const setAdminToken = (token) => {
  if (token) {
    localStorage.setItem('admin_token', token);
  } else {
    localStorage.removeItem('admin_token');
  }
};

export const setClientToken = (token) => {
  if (token) {
    localStorage.setItem('client_token', token);
  } else {
    localStorage.removeItem('client_token');
  }
};

const getHeaders = (useClientToken = false) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = useClientToken
    ? localStorage.getItem('client_token')
    : localStorage.getItem('admin_token');
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
      err.status = response.status;
      if (response.status === 409 && data.error === 'SESSION_REPLACED') {
        err.message = 'SESSION_REPLACED';
      }
      throw err;
    }
    return data;
  }
  if (!response.ok) {
    const err = new Error(`Error ${response.status}`);
    err.status = response.status;
    throw err;
  }
  return response.text();
};

export const api = {
  get: async (url, useClientToken = false, signal) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: getHeaders(useClientToken),
        signal: signal || controller.signal,
      });
      return handleResponse(response);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  post: async (url, body, useClientToken = false, signal) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: getHeaders(useClientToken),
        body: JSON.stringify(body),
        signal: signal || controller.signal,
      });
      return handleResponse(response);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  patch: async (url, body, useClientToken = false, signal) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'PATCH',
        headers: getHeaders(useClientToken),
        body: JSON.stringify(body),
        signal: signal || controller.signal,
      });
      return handleResponse(response);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  delete: async (url, useClientToken = false, signal) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        headers: getHeaders(useClientToken),
        signal: signal || controller.signal,
      });
      return handleResponse(response);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
