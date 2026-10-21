import { API, headers, logout } from './auth.js';

export async function getProjects() {
  try {
    const res = await fetch(`${API}/projects`, {
      headers: headers(),
    });
    if (res.status === 401) {
      logout();
      return [];
    }
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch projects:', err);
    return [];
  }
}

export async function createProject(data) {
  try {
    const res = await fetch(`${API}/projects`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to create project:', err);
    return { error: 'Network error creating project' };
  }
}

export async function updateProject(id, data) {
  try {
    const res = await fetch(`${API}/projects/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to update project:', err);
    return { error: 'Network error updating project' };
  }
}

export async function deleteProject(id) {
  try {
    const res = await fetch(`${API}/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete project:', err);
    return false;
  }
}
