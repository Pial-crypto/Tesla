const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tesla_token');
}

export function setSession(token, user) {
  localStorage.setItem('tesla_token', token);
  localStorage.setItem('tesla_user', JSON.stringify(user));
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('tesla_user');
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem('tesla_token');
  localStorage.removeItem('tesla_user');
}

export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken();
  // console.log(`API Request: ${method} ${BASE}api${path}`, body ? `Body: ${JSON.stringify(body)}` : '');
  const res = await fetch(`${BASE}api${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json();

    // console.log("API Response:", data);
   } catch { 
    // console.warn("Failed to parse JSON response from API");
    
   }
  if (!res.ok) {throw new Error(data?.error || `request failed (${res.status})`);}
  return data;
}
