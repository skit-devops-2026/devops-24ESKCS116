export const API = '/api';

export const setToken = (t) => localStorage.setItem('jwt', t);
export const getToken = () => localStorage.getItem('jwt');
export const clearToken = () => localStorage.removeItem('jwt');

export const headers = () => {
  const h = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

export async function signup(data) {
  try {
    const r = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    const d = await r.json().catch(() => ({}));
    return {
      success: r.ok,
      ...d,
      message: d.message || d.error || (r.ok ? 'Signup successful' : 'Signup failed'),
    };
  } catch (err) {
    return { success: false, message: 'Network error during signup' };
  }
}

export async function login(data) {
  try {
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.token) {
      setToken(d.token);
    }
    return {
      success: r.ok,
      ...d,
      message: d.message || d.error || (r.ok ? 'Login successful' : 'Invalid credentials'),
    };
  } catch (err) {
    return { success: false, message: 'Network error during login' };
  }
}

export function logout() {
  clearToken();
  const currentPath = window.location.pathname;
  if (currentPath.includes('/pages/')) {
    window.location.href = 'login.html';
  } else {
    window.location.href = 'pages/login.html';
  }
}
