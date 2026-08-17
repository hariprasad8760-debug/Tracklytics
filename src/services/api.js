/**
 * ============================================================================
 * FILE: src/services/api.js
 * ============================================================================
 * Establishes the native Fetch HTTP client configured with the Spring Boot backend 
 * base URL (`http://localhost:8080/api/v1`) for real-time MySQL CRUD operations.
 * ============================================================================
 */

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const apiClient = {
  get: async (endpoint) => {
    const token = localStorage.getItem('tracklytics_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'GET', headers });
    return res.json();
  },

  post: async (endpoint, data) => {
    const token = localStorage.getItem('tracklytics_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  }
};

export default apiClient;
