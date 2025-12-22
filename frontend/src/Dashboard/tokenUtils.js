import { jwtDecode } from 'jwt-decode';

// Internal helper to Check if token is expiring
const isTokenExpiring = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp - currentTime < 600; // Refresh if less than 10 minutes remaining
  } catch (error) {
    console.error("Token decoding error:", error);
    return true; // Consider invalid tokens as expired
  }
};

// Internal helper to refresh the access token using the refresh token
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    window.location.href = '/Auth'; // Redirect to login page
    return null;
  }
};

// Exported function to get a valid token (either the current one or a refreshed one)
const getValidToken = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token || isTokenExpiring(token)) {
    console.log("Token is expiring or missing, refreshing...");
    return await refreshToken();
  }
  return token;
};

export default getValidToken; 