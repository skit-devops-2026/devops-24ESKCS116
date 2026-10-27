import { getToken, getUser, logout } from './auth.js';
import { getProjects, getProject, updateProject } from './projects.js';
import { getTasks, createTask, updateTask, deleteTask } from './tasks.js';

// DOM elements
const projectNameEl = document.getElementById('projectName');
const projectDescEl = document.getElementById('projectDesc');
const editProjectBtn = document.getElementById('editProjectBtn');
const openAddTaskModalBtn = document.getElementById('openAddTaskModalBtn');
const addFirstTaskBtn = document.getElementById('addFirstTaskBtn');
const userAvatar = document.getElementById('userAvatar');
const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');

// Stats elements
const statTotalEl = document.getElementById('statTotal');
const statToDoEl = document.getElementById('statToDo');
const statInProgressEl = document.getElementById('statInProgress');
const statCompletedEl = document.getElementById('statCompleted');
const progressPercentEl = document.getElementById('progressPercent');
const progressBarEl = document.getElementById('progressBar');

// Tasks elements
const tasksContainer = document.getElementById('tasksContainer');
const tasksLoadingState = document.getElementById('tasksLoadingState');
const tasksEmptyState = document.getElementById('tasksEmptyState');
const tasksList = document.getElementById('tasksList');

// Task Modal elements
const taskModal = document.getElementById('taskModal');
const taskModalTitle = document.getElementById('taskModalTitle');
const taskForm = document.getElementById('taskForm');
const taskFormId = document.getElementById('taskFormId');
const taskTitleInput = document.getElementById('taskTitleInput');
const taskDescInput = document.getElementById('taskDescInput');
const taskStatusSelect = document.getElementById('taskStatusSelect');
const taskPrioritySelect = document.getElementById('taskPrioritySelect');
const closeTaskModalBtn = document.getElementById('closeTaskModalBtn');
const cancelTaskModalBtn = document.getElementById('cancelTaskModalBtn');

// Project Modal elements
const projectModal = document.getElementById('projectModal');
const projectForm = document.getElementById('projectForm');
const projectNameInput = document.getElementById('projectNameInput');
const projectDescInput = document.getElementById('projectDescInput');
const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');
const cancelProjectModalBtn = document.getElementById('cancelProjectModalBtn');

// Confirm Modal elements
const confirmModal = document.getElementById('confirmModal');
const confirmModalTitle = document.getElementById('confirmModalTitle');
const confirmModalMsg = document.getElementById('confirmModalMsg');
const confirmModalOkBtn = document.getElementById('confirmModalOkBtn');
const confirmModalCancelBtn = document.getElementById('confirmModalCancelBtn');

// State
let currentProject = null;
let currentProjectId = null;
let currentTasks = [];
let pendingConfirmAction = null;

// Ensure authentication
function checkAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  const user = getUser();
  if (user && user.name && userAvatar) {
    userAvatar.textContent = user.name.charAt(0).toUpperCase();
    userAvatar.title = user.name;
  }
  return true;
}

// Confirmation helper
function showConfirm(title, message) {
  return new Promise((resolve) => {
    confirmModalTitle.textContent = title;
    confirmModalMsg.textContent = message;
    confirmModal.classList.remove('hidden');

    pendingConfirmAction = (confirmed) => {
      confirmModal.classList.add('hidden');
      pendingConfirmAction = null;
      resolve(confirmed);
    };
  });
}

confirmModalOkBtn?.addEventListener('click', () => {
  if (pendingConfirmAction) pendingConfirmAction(true);
});

confirmModalCancelBtn?.addEventListener('click', () => {
  if (pendingConfirmAction) pendingConfirmAction(false);
});

// Calculate and render stats
function updateStats(tasks) {
  const total = tasks.length;
  const toDo = tasks.filter(t => t.status === 'To Do').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const completed = tasks.filter(t => t.status === 'Done').length;

  statTotalEl.textContent = total;
  statToDoEl.textContent = toDo;
  statInProgressEl.textContent = inProgress;
  statCompletedEl.textContent = completed;

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  progressPercentEl.textContent = `${percent}%`;
  progressBarEl.style.width = `${percent}%`;
}

// Priority badge helper
function getPriorityBadge(priority) {
  switch (priority) {
    case 'High':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/60">High</span>`;
    case 'Low':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200/60">Low</span>`;
    default:
      return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">Medium</span>`;
  }
}

// Status badge helper
function getStatusBadge(status) {
  switch (status) {
    case 'Done':
      return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        Done
      </span>`;
    case 'In Progress':
      return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        In Progress
      </span>`;
    default:
      return `<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">To Do</span>`;
  }
}

// Render task list
function renderTasks(tasks) {
  tasksLoadingState.classList.add('hidden');

  if (!tasks || tasks.length === 0) {
    tasksList.classList.add('hidden');
    tasksEmptyState.classList.remove('hidden');
    return;
  }

  tasksEmptyState.classList.add('hidden');
  tasksList.classList.remove('hidden');
  tasksList.innerHTML = '';

  tasks.forEach((task) => {
    const taskId = task.id || task._id;
    const isDone = task.status === 'Done';

    const card = document.createElement('div');
    card.className = `bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
      isDone ? 'bg-slate-50/50 opacity-80' : ''
    }`;

    // Task details
    const leftDiv = document.createElement('div');
    leftDiv.className = 'flex items-start gap-3.5 flex-1 min-w-0';

    // Status toggle checkbox
    const checkBtn = document.createElement('button');
    checkBtn.type = 'button';
    checkBtn.title = isDone ? 'Mark as To Do' : 'Mark as Done';
    checkBtn.className = `mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
      isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 hover:border-indigo-500 bg-white'
    }`;
    checkBtn.innerHTML = isDone
      ? `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>`
      : '';
    checkBtn.addEventListener('click', async () => {
      const nextStatus = isDone ? 'To Do' : 'Done';
      await updateTask(taskId, { status: nextStatus });
      await loadProjectTasks();
    });

    const infoDiv = document.createElement('div');
    infoDiv.className = 'flex-1 min-w-0';

    const titleRow = document.createElement('div');
    titleRow.className = 'flex items-center gap-2 flex-wrap';

    const titleEl = document.createElement('h4');
    titleEl.className = `text-sm font-semibold text-gray-900 ${isDone ? 'line-through text-gray-400' : ''}`;
    titleEl.textContent = task.title;
    titleRow.appendChild(titleEl);

    // Badges container
    const badgesSpan = document.createElement('div');
    badgesSpan.className = 'flex items-center gap-1.5';
    badgesSpan.innerHTML = `${getPriorityBadge(task.priority)} ${getStatusBadge(task.status)}`;
    titleRow.appendChild(badgesSpan);

    infoDiv.appendChild(titleRow);

    if (task.description) {
      const descEl = document.createElement('p');
      descEl.className = 'text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed';
      descEl.textContent = task.description;
      infoDiv.appendChild(descEl);
    }

    leftDiv.appendChild(checkBtn);
    leftDiv.appendChild(infoDiv);

    // Right actions
    const rightDiv = document.createElement('div');
    rightDiv.className = 'flex items-center gap-2 self-end sm:self-center shrink-0';

    // Status quick changer
    const statusSelect = document.createElement('select');
    statusSelect.className = 'text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-gray-700 hover:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer';
    ['To Do', 'In Progress', 'Done'].forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      if (task.status === s) opt.selected = true;
      statusSelect.appendChild(opt);
    });
    statusSelect.addEventListener('change', async (e) => {
      await updateTask(taskId, { status: e.target.value });
      await loadProjectTasks();
    });
    rightDiv.appendChild(statusSelect);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition cursor-pointer';
    editBtn.title = 'Edit task';
    editBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>`;
    editBtn.addEventListener('click', () => openTaskModal(task));
    rightDiv.appendChild(editBtn);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer';
    deleteBtn.title = 'Delete task';
    deleteBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`;
    deleteBtn.addEventListener('click', async () => {
      const ok = await showConfirm('Delete Task', `Are you sure you want to delete "${task.title}"?`);
      if (ok) {
        await deleteTask(taskId);
        await loadProjectTasks();
      }
    });
    rightDiv.appendChild(deleteBtn);

    card.appendChild(leftDiv);
    card.appendChild(rightDiv);
    tasksList.appendChild(card);
  });
}

// Load tasks for the project
async function loadProjectTasks() {
  if (!currentProjectId) return;
  const tasks = await getTasks(currentProjectId);
  currentTasks = Array.isArray(tasks) ? tasks : [];
  updateStats(currentTasks);
  renderTasks(currentTasks);
}

// Task Modal handling
function openTaskModal(task = null) {
  if (task) {
    taskModalTitle.textContent = 'Edit Task';
    taskFormId.value = task.id || task._id;
    taskTitleInput.value = task.title || '';
    taskDescInput.value = task.description || '';
    taskStatusSelect.value = task.status || 'To Do';
    taskPrioritySelect.value = task.priority || 'Medium';
  } else {
    taskModalTitle.textContent = 'Add Task';
    taskFormId.value = '';
    taskTitleInput.value = '';
    taskDescInput.value = '';
    taskStatusSelect.value = 'To Do';
    taskPrioritySelect.value = 'Medium';
  }
  taskModal.classList.remove('hidden');
  taskTitleInput.focus();
}

function closeTaskModal() {
  taskModal.classList.add('hidden');
}

taskForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  const description = taskDescInput.value.trim();
  const status = taskStatusSelect.value;
  const priority = taskPrioritySelect.value;
  const id = taskFormId.value;

  if (!title) return;

  if (id) {
    await updateTask(id, { title, description, status, priority });
  } else {
    await createTask({
      projectId: currentProjectId,
      title,
      description,
      status,
      priority,
    });
  }

  closeTaskModal();
  await loadProjectTasks();
});

// Project Modal handling
function openProjectModal() {
  if (!currentProject) return;
  projectNameInput.value = currentProject.name || '';
  projectDescInput.value = currentProject.description || '';
  projectModal.classList.remove('hidden');
  projectNameInput.focus();
}

function closeProjectModal() {
  projectModal.classList.add('hidden');
}

projectForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = projectNameInput.value.trim();
  const description = projectDescInput.value.trim();
  if (!name) return;

  const updated = await updateProject(currentProjectId, { name, description });
  if (updated && !updated.error) {
    currentProject.name = name;
    currentProject.description = description;
    projectNameEl.textContent = name;
    projectDescEl.textContent = description || 'No description provided.';
    document.title = `${name} — DevFlow`;
  }
  closeProjectModal();
});

// Modal close button listeners
closeTaskModalBtn?.addEventListener('click', closeTaskModal);
cancelTaskModalBtn?.addEventListener('click', closeTaskModal);
closeProjectModalBtn?.addEventListener('click', closeProjectModal);
cancelProjectModalBtn?.addEventListener('click', closeProjectModal);
openAddTaskModalBtn?.addEventListener('click', () => openTaskModal());
addFirstTaskBtn?.addEventListener('click', () => openTaskModal());
editProjectBtn?.addEventListener('click', openProjectModal);

// Close modals when clicking backdrop
window.addEventListener('click', (e) => {
  if (e.target === taskModal) closeTaskModal();
  if (e.target === projectModal) closeProjectModal();
  if (e.target === confirmModal && pendingConfirmAction) pendingConfirmAction(false);
});

// Initialize and load project
async function init() {
  if (!checkAuth()) return;

  sidebarLogoutBtn?.addEventListener('click', logout);

  const urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get('id') || urlParams.get('projectId');

  // If no ID in query params, fetch projects and fallback to the first project
  if (!id) {
    const projects = await getProjects();
    if (projects && projects.length > 0) {
      id = projects[0].id || projects[0]._id;
      // Update browser URL without reloading
      const newUrl = `${window.location.pathname}?id=${encodeURIComponent(id)}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    } else {
      // No projects created yet
      projectNameEl.textContent = 'No Projects Found';
      projectDescEl.textContent = 'Please create a project from the dashboard to get started.';
      tasksLoadingState.innerHTML = `
        <p class="text-gray-500 text-sm font-medium">No projects available.</p>
        <a href="dashboard.html" class="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
          Go to Dashboard
        </a>
      `;
      return;
    }
  }

  currentProjectId = id;

  // Fetch project details
  currentProject = await getProject(id);
  if (!currentProject) {
    projectNameEl.textContent = 'Project Not Found';
    projectDescEl.textContent = 'The requested project could not be found or you do not have permission to view it.';
    tasksLoadingState.innerHTML = `
      <p class="text-gray-500 text-sm font-medium">Could not load project tasks.</p>
      <a href="dashboard.html#projectsSection" class="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
        Back to All Projects
      </a>
    `;
    return;
  }

  // Populate project details in UI
  projectNameEl.textContent = currentProject.name;
  projectDescEl.textContent = currentProject.description || 'No description provided.';
  editProjectBtn.classList.remove('hidden');
  document.title = `${currentProject.name} — DevFlow`;

  // Fetch and display tasks
  await loadProjectTasks();
}

// Start on DOMContentLoaded
document.addEventListener('DOMContentLoaded', init);
