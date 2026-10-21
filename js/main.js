import { signup, login, logout, getToken } from './auth.js';
import { getProjects, createProject, deleteProject, updateProject } from './projects.js';
import { getTasks, createTask, updateTask, deleteTask } from './tasks.js';

function showAlert(msg, ok = true) {
  alert(msg);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---------- Auth pages ----------
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: e.target.name.value.trim(),
      email: e.target.email.value.trim(),
      password: e.target.password.value,
    };
    const res = await signup(data);
    if (res.success) {
      showAlert('Signup successful! Please log in.');
      window.location.href = 'login.html';
    } else {
      showAlert(res.message || 'Signup failed');
    }
  });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      email: e.target.email.value.trim(),
      password: e.target.password.value,
    };
    const res = await login(data);
    if (res.token) {
      window.location.href = 'dashboard.html';
    } else {
      showAlert(res.message || 'Login failed');
    }
  });
}

// ---------- Dashboard ----------
if (document.body.classList.contains('dashboard') || document.getElementById('projectList')) {
  // If user is not authenticated on the dashboard, redirect to login
  if (!getToken()) {
    window.location.href = 'login.html';
  }

  let selectedProjectId = null;
  const projectListDiv = document.getElementById('projectList');
  const createProjectBtn = document.getElementById('createProjectBtn');
  const addTaskBtn = document.getElementById('addTaskBtn');

  async function loadProjects() {
    if (!projectListDiv) return;
    const proj = await getProjects();
    projectListDiv.innerHTML = '';

    if (!Array.isArray(proj) || proj.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'text-gray-400 text-sm p-4';
      emptyMsg.textContent = 'No projects yet. Click "Create New Project" to get started.';
      projectListDiv.appendChild(emptyMsg);
      return;
    }

    proj.forEach((p) => {
      const isSelected = selectedProjectId === p.id;
      const div = document.createElement('div');
      div.className = `p-3 border-b flex justify-between items-center transition ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
      }`;

      // Left container: Name and description
      const leftContainer = document.createElement('div');
      const nameSpan = document.createElement('span');
      nameSpan.className = 'font-semibold text-gray-800';
      nameSpan.textContent = p.name;
      leftContainer.appendChild(nameSpan);

      if (p.description) {
        const descP = document.createElement('p');
        descP.className = 'text-xs text-gray-500 mt-0.5';
        descP.textContent = p.description;
        leftContainer.appendChild(descP);
      }
      div.appendChild(leftContainer);

      // Right container: Action buttons
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'flex items-center gap-2';

      const viewBtn = document.createElement('button');
      viewBtn.className = 'text-xs font-semibold px-2.5 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition';
      viewBtn.dataset.id = p.id;
      viewBtn.dataset.action = 'view';
      viewBtn.textContent = isSelected ? 'Viewing Tasks' : 'View Tasks';
      actionsDiv.appendChild(viewBtn);

      const delBtn = document.createElement('button');
      delBtn.className = 'text-xs font-semibold px-2.5 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition';
      delBtn.dataset.id = p.id;
      delBtn.dataset.action = 'delete';
      delBtn.textContent = 'Delete';
      actionsDiv.appendChild(delBtn);

      div.appendChild(actionsDiv);
      projectListDiv.appendChild(div);
    });
  }

  async function loadTasks(projectId) {
    if (!projectListDiv) return;
    const tasks = await getTasks(projectId);
    const taskDiv = document.createElement('div');
    taskDiv.id = 'taskList';
    taskDiv.className = 'mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex justify-between items-center mb-3';

    const headerTitle = document.createElement('h3');
    headerTitle.className = 'font-bold text-gray-800 text-sm uppercase tracking-wide';
    headerTitle.textContent = 'Project Tasks';
    headerDiv.appendChild(headerTitle);

    const countSpan = document.createElement('span');
    countSpan.className = 'text-xs text-gray-400';
    countSpan.textContent = `Total: ${Array.isArray(tasks) ? tasks.length : 0}`;
    headerDiv.appendChild(countSpan);

    taskDiv.appendChild(headerDiv);

    if (!Array.isArray(tasks) || tasks.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'text-gray-400 text-sm py-3 text-center';
      emptyMsg.textContent = 'No tasks in this project. Click "Add New Task" to create one.';
      taskDiv.appendChild(emptyMsg);
    } else {
      tasks.forEach((t) => {
        const tDiv = document.createElement('div');
        tDiv.className = 'p-3 mb-2 bg-white border border-gray-200 rounded-lg flex justify-between items-center shadow-xs';

        // Task details
        const infoDiv = document.createElement('div');
        const titleSpan = document.createElement('span');
        titleSpan.className = 'font-medium text-gray-800';
        titleSpan.textContent = t.title;
        infoDiv.appendChild(titleSpan);

        const statusSpan = document.createElement('span');
        statusSpan.className = `text-xs font-medium px-2 py-0.5 rounded-full ml-2 ${
          t.status === 'Done' ? 'bg-green-100 text-green-700' : t.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
        }`;
        statusSpan.textContent = t.status || 'To Do';
        infoDiv.appendChild(statusSpan);

        const prioritySpan = document.createElement('span');
        prioritySpan.className = 'text-xs font-medium px-2 py-0.5 rounded-full ml-1 bg-blue-50 text-blue-600';
        prioritySpan.textContent = t.priority || 'Low';
        infoDiv.appendChild(prioritySpan);

        if (t.description) {
          const descP = document.createElement('p');
          descP.className = 'text-xs text-gray-500 mt-0.5';
          descP.textContent = t.description;
          infoDiv.appendChild(descP);
        }
        tDiv.appendChild(infoDiv);

        // Action buttons
        const actionBtns = document.createElement('div');
        actionBtns.className = 'flex items-center gap-2';

        const editBtn = document.createElement('button');
        editBtn.className = 'text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition';
        editBtn.dataset.id = t.id;
        editBtn.dataset.action = 'edit';
        editBtn.textContent = 'Edit';
        actionBtns.appendChild(editBtn);

        const delTaskBtn = document.createElement('button');
        delTaskBtn.className = 'text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition';
        delTaskBtn.dataset.id = t.id;
        delTaskBtn.dataset.action = 'delete';
        delTaskBtn.textContent = 'Del';
        actionBtns.appendChild(delTaskBtn);

        tDiv.appendChild(actionBtns);
        taskDiv.appendChild(tDiv);
      });
    }

    const old = document.getElementById('taskList');
    if (old) {
      old.replaceWith(taskDiv);
    } else {
      projectListDiv.appendChild(taskDiv);
    }
  }

  if (createProjectBtn) {
    createProjectBtn.addEventListener('click', async () => {
      const name = prompt('Project name:');
      if (!name || !name.trim()) return;
      const description = prompt('Project description (optional):') || '';
      await createProject({ name: name.trim(), description: description.trim() });
      await loadProjects();
    });
  }

  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', async () => {
      if (!selectedProjectId) {
        alert('Select a project first by clicking "View Tasks".');
        return;
      }
      const title = prompt('Task title:');
      if (!title || !title.trim()) return;
      await createTask({
        projectId: selectedProjectId,
        title: title.trim(),
        status: 'To Do',
        priority: 'Medium',
      });
      await loadTasks(selectedProjectId);
    });
  }

  // Delegate clicks for project list actions
  if (projectListDiv) {
    projectListDiv.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn || !btn.dataset || !btn.dataset.id) return;

      const id = btn.dataset.id;
      const action = btn.dataset.action;

      if (action === 'view') {
        selectedProjectId = id;
        await loadProjects();
        await loadTasks(id);
      } else if (action === 'delete') {
        if (confirm('Delete this project?')) {
          await deleteProject(id);
          if (selectedProjectId === id) selectedProjectId = null;
          await loadProjects();
          const oldTaskDiv = document.getElementById('taskList');
          if (oldTaskDiv) oldTaskDiv.remove();
        }
      } else if (action === 'delete-task' || (action === 'delete' && !btn.closest('#projectList > div'))) {
        if (confirm('Delete task?')) {
          await deleteTask(id);
          if (selectedProjectId) await loadTasks(selectedProjectId);
        }
      }
    });

    // Delegate task specific actions
    projectListDiv.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn || !btn.dataset || !btn.dataset.action || !btn.dataset.id) return;
      const taskId = btn.dataset.id;
      const action = btn.dataset.action;

      if (btn.closest('#taskList')) {
        if (action === 'delete') {
          if (confirm('Delete task?')) {
            await deleteTask(taskId);
            if (selectedProjectId) await loadTasks(selectedProjectId);
          }
        } else if (action === 'edit') {
          const newTitle = prompt('New task title:');
          if (newTitle && newTitle.trim()) {
            await updateTask(taskId, { title: newTitle.trim() });
            if (selectedProjectId) await loadTasks(selectedProjectId);
          }
        }
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
    });
  }

  // Initial load
  loadProjects();
}
