/**
 * Get cookie by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export const getCookie = (name) => {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  
  return null;
};

/**
 * Set a cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Expiration in days
 */
export const setCookie = (name, value, days = 7) => {
  if (typeof document === 'undefined') {
    return;
  }
  
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
};

/**
 * Delete a cookie
 * @param {string} name - Cookie name to delete
 */
export const deleteCookie = (name) => {
  if (typeof document === 'undefined') {
    return;
  }
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export default {
  get: getCookie,
  set: setCookie,
  remove: deleteCookie
};
