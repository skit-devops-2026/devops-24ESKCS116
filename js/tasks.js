import { API, headers, logout } from './auth.js';

export async function getTasks(projectId) {
  try {
    const url = projectId
      ? `${API}/tasks?projectId=${encodeURIComponent(projectId)}`
      : `${API}/tasks`;
    const res = await fetch(url, {
      headers: headers(),
    });
    if (res.status === 401) {
      logout();
      return [];
    }
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
    return [];
  }
}

export async function createTask(data) {
  try {
    const res = await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to create task:', err);
    return { error: 'Network error creating task' };
  }
}

export async function updateTask(id, data) {
  try {
    const res = await fetch(`${API}/tasks/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to update task:', err);
    return { error: 'Network error updating task' };
  }
}

export async function deleteTask(id) {
  try {
    const res = await fetch(`${API}/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete task:', err);
    return false;
  }
}
