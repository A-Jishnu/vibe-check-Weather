const API_URL = 'http://localhost:3001/api';

let authToken = localStorage.getItem('token');

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => authToken;

export const isAuthenticated = () => !!authToken;

// Auth API
export const register = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  setAuthToken(data.token);
  return data;
};

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  setAuthToken(data.token);
  return data;
};

export const logout = () => {
  setAuthToken(null);
};

// Weather API (through backend)
export const getWeatherData = async (lat, lon) => {
  const res = await fetch(`${API_URL}/weather?lat=${lat}&lon=${lon}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const searchLocation = async (query) => {
  const res = await fetch(`${API_URL}/geocode?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.results || [];
};

// Saved locations
export const getSavedLocations = async () => {
  const res = await fetch(`${API_URL}/locations`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const saveLocation = async (city, lat, lon, country) => {
  const res = await fetch(`${API_URL}/locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ city, lat, lon, country }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const deleteLocation = async (id) => {
  const res = await fetch(`${API_URL}/locations/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};
