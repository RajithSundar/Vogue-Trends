/**
 * Base URL for API requests.
 * Uses the VITE_API_URL environment variable if provided (e.g. for Vercel pointing to Render).
 * Defaults to an empty string for local development where the API is on the same host (relative path).
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Helper to construct full API URLs.
 * @param {string} endpoint - The API endpoint starting with a slash (e.g., '/api/products')
 * @returns {string} The full URL
 */
export function getApiUrl(endpoint) {
  // Ensure we don't end up with double slashes if API_BASE_URL has a trailing slash
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
}
