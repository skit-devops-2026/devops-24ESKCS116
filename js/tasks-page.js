import { getToken, getUser, logout } from './auth.js';
import { getProjects } from './projects.js';
import { getTasks, createTask, updateTask, deleteTask } from './tasks.js';

// DOM elements
const searchTasksInput = document.getElementById('searchTasksInput');
const projectFilterSelect = document.getElementById('projectFilterSelect');
const statusFilterSelect = document.getElementById('statusFilterSelect');
const priorityFilterSelect = document.getElementById('priorityFilterSelect');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const taskCountStatus = document.getElementById('taskCountStatus');

const tasksContainer = document.getElementById('tasksContainer');
const tasksLoadingState = document.getElementById('tasksLoadingState');
const tasksEmptyState = document.getElementById('tasksEmptyState');
const emptyStateMsg = document.getElementById('emptyStateMsg');
const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
const tasksList = document.getElementById('tasksList');

const openNewTaskBtn = document.getElementById('openNewTaskBtn');
const userAvatar = document.getElementById('userAvatar');
const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');

// Task Modal elements
const taskModal = document.getElementById('taskModal');
const taskModalTitle = document.getElementById('taskModalTitle');
const taskForm = document.getElementById('taskForm');
const taskFormId = document.getElementById('taskFormId');
const taskProjectSelect = document.getElementById('taskProjectSelect');
const taskTitleInput = document.getElementById('taskTitleInput');
const taskDescInput = document.getElementById('taskDescInput');
const taskStatusSelect = document.getElementById('taskStatusSelect');
const taskPrioritySelect = document.getElementById('taskPrioritySelect');
const closeTaskModalBtn = document.getElementById('closeTaskModalBtn');
const cancelTaskModalBtn = document.getElementById('cancelTaskModalBtn');

// Confirm Modal elements
const confirmModal = document.getElementById('confirmModal');
const confirmModalTitle = document.getElementById('confirmModalTitle');
const confirmModalMsg = document.getElementById('confirmModalMsg');
const confirmModalOkBtn = document.getElementById('confirmModalOkBtn');
const confirmModalCancelBtn = document.getElementById('confirmModalCancelBtn');

// State
let allTasks = [];
let allProjects = [];
let projectMap = new Map();
let pendingConfirmAction = null;

// Ensure authentication
function checkAuth() {
  const token = getToken();
  if (!token) {
    const isPages = window.location.pathname.includes('/pages/');
    window.location.href = isPages ? 'login.html' : 'pages/login.html';
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

// Filter tasks based on search and select inputs
function getFilteredTasks() {
  const searchQuery = searchTasksInput.value.trim().toLowerCase();
  const selectedProject = projectFilterSelect.value;
  const selectedStatus = statusFilterSelect.value;
  const selectedPriority = priorityFilterSelect.value;

  return allTasks.filter((task) => {
    // Search query matches title or description
    if (searchQuery) {
      const titleMatch = task.title && task.title.toLowerCase().includes(searchQuery);
      const descMatch = task.description && task.description.toLowerCase().includes(searchQuery);
      if (!titleMatch && !descMatch) return false;
    }

    // Project filter
    if (selectedProject) {
      const taskProjId = String(task.projectId || task.project);
      if (taskProjId !== String(selectedProject)) return false;
    }

    // Status filter
    if (selectedStatus && task.status !== selectedStatus) {
      return false;
    }

    // Priority filter
    if (selectedPriority && task.priority !== selectedPriority) {
      return false;
    }

    return true;
  });
}

// Render filtered tasks
function renderTasks() {
  tasksLoadingState.classList.add('hidden');
  const filtered = getFilteredTasks();

  // Update status count label
  if (allTasks.length === 0) {
    taskCountStatus.textContent = '0 tasks found';
  } else if (filtered.length === allTasks.length) {
    taskCountStatus.textContent = `Showing all ${allTasks.length} tasks`;
  } else {
    taskCountStatus.textContent = `Showing ${filtered.length} of ${allTasks.length} tasks`;
  }

  if (filtered.length === 0) {
    tasksList.classList.add('hidden');
    tasksEmptyState.classList.remove('hidden');
    if (allTasks.length === 0) {
      emptyStateMsg.textContent = 'No tasks found. Create your first task to get started!';
    } else {
      emptyStateMsg.textContent = 'No tasks found matching your filters.';
    }
    return;
  }

  tasksEmptyState.classList.add('hidden');
  tasksList.classList.remove('hidden');
  tasksList.innerHTML = '';

  const isPages = window.location.pathname.includes('/pages/');
  const projectDetailsBasePath = isPages ? 'project-details.html' : 'pages/project-details.html';

  filtered.forEach((task) => {
    const taskId = task.id || task._id;
    const isDone = task.status === 'Done';
    const projId = task.projectId || task.project;
    const projName = projectMap.get(String(projId)) || 'Project';

    const card = document.createElement('div');
    card.className = `bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
      isDone ? 'bg-slate-50/50 opacity-80' : ''
    }`;

    // Task details left
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
      await loadData();
    });

    const infoDiv = document.createElement('div');
    infoDiv.className = 'flex-1 min-w-0';

    const titleRow = document.createElement('div');
    titleRow.className = 'flex items-center gap-2 flex-wrap';

    const titleEl = document.createElement('h4');
    titleEl.className = `text-sm font-semibold text-gray-900 ${isDone ? 'line-through text-gray-400' : ''}`;
    titleEl.textContent = task.title;
    titleRow.appendChild(titleEl);

    // Project Link Badge
    if (projId) {
      const projBadge = document.createElement('a');
      projBadge.href = `${projectDetailsBasePath}?id=${encodeURIComponent(projId)}`;
      projBadge.className = 'inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full transition';
      projBadge.title = `View ${projName} details`;
      projBadge.innerHTML = `
        <svg class="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
        <span class="truncate max-w-[130px]">${projName}</span>
      `;
      titleRow.appendChild(projBadge);
    }

    // Priority & Status Badges
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

    // Actions right
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
      await loadData();
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
        await loadData();
      }
    });
    rightDiv.appendChild(deleteBtn);

    card.appendChild(leftDiv);
    card.appendChild(rightDiv);
    tasksList.appendChild(card);
  });
}

// Populate project select dropdowns
function populateProjectSelects(projects) {
  // Clear filter dropdown options (keeping "All projects")
  projectFilterSelect.innerHTML = '<option value="">All projects</option>';
  taskProjectSelect.innerHTML = '<option value="" disabled selected>Select a project</option>';

  projects.forEach((p) => {
    const id = p.id || p._id;
    // Filter select
    const optFilter = document.createElement('option');
    optFilter.value = id;
    optFilter.textContent = p.name;
    projectFilterSelect.appendChild(optFilter);

    // Modal select
    const optModal = document.createElement('option');
    optModal.value = id;
    optModal.textContent = p.name;
    taskProjectSelect.appendChild(optModal);
  });
}

// Load all projects and tasks
async function loadData() {
  const [projects, tasks] = await Promise.all([
    getProjects(),
    getTasks(), // fetches all tasks when projectId is omitted
  ]);

  allProjects = Array.isArray(projects) ? projects : [];
  allTasks = Array.isArray(tasks) ? tasks : [];

  projectMap = new Map();
  allProjects.forEach((p) => {
    projectMap.set(String(p.id || p._id), p.name);
  });

  populateProjectSelects(allProjects);
  renderTasks();
}

// Task Modal handling
function openTaskModal(task = null) {
  if (allProjects.length === 0) {
    const isPages = window.location.pathname.includes('/pages/');
    const dest = isPages ? 'dashboard.html#projectsSection' : 'pages/dashboard.html#projectsSection';
    alert('Please create a project first before creating tasks.');
    window.location.href = dest;
    return;
  }

  if (task) {
    taskModalTitle.textContent = 'Edit Task';
    taskFormId.value = task.id || task._id;
    taskProjectSelect.value = String(task.projectId || task.project);
    taskProjectSelect.disabled = true; // keep project stable during task edit
    taskTitleInput.value = task.title || '';
    taskDescInput.value = task.description || '';
    taskStatusSelect.value = task.status || 'To Do';
    taskPrioritySelect.value = task.priority || 'Medium';
  } else {
    taskModalTitle.textContent = 'New Task';
    taskFormId.value = '';
    taskProjectSelect.disabled = false;
    // Preselect current filter if any
    if (projectFilterSelect.value) {
      taskProjectSelect.value = projectFilterSelect.value;
    } else if (allProjects.length > 0) {
      taskProjectSelect.value = allProjects[0].id || allProjects[0]._id;
    }
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
  const projectId = taskProjectSelect.value;
  const title = taskTitleInput.value.trim();
  const description = taskDescInput.value.trim();
  const status = taskStatusSelect.value;
  const priority = taskPrioritySelect.value;
  const id = taskFormId.value;

  if (!title) return;
  if (!projectId && !id) {
    alert('Please select a project');
    return;
  }

  if (id) {
    await updateTask(id, { title, description, status, priority });
  } else {
    await createTask({
      projectId,
      title,
      description,
      status,
      priority,
    });
  }

  closeTaskModal();
  await loadData();
});

// Event listeners for filtering
searchTasksInput?.addEventListener('input', renderTasks);
projectFilterSelect?.addEventListener('change', renderTasks);
statusFilterSelect?.addEventListener('change', renderTasks);
priorityFilterSelect?.addEventListener('change', renderTasks);

clearFiltersBtn?.addEventListener('click', () => {
  searchTasksInput.value = '';
  projectFilterSelect.value = '';
  statusFilterSelect.value = '';
  priorityFilterSelect.value = '';
  renderTasks();
});

// Modal controls
openNewTaskBtn?.addEventListener('click', () => openTaskModal());
emptyStateAddBtn?.addEventListener('click', () => openTaskModal());
closeTaskModalBtn?.addEventListener('click', closeTaskModal);
cancelTaskModalBtn?.addEventListener('click', closeTaskModal);

// Close modals when clicking backdrop
window.addEventListener('click', (e) => {
  if (e.target === taskModal) closeTaskModal();
  if (e.target === confirmModal && pendingConfirmAction) pendingConfirmAction(false);
});

// Initialize
async function init() {
  if (!checkAuth()) return;

  sidebarLogoutBtn?.addEventListener('click', logout);

  // If a projectId or status is in query parameters, apply it to the filters
  const urlParams = new URLSearchParams(window.location.search);
  const qProject = urlParams.get('projectId') || urlParams.get('project');
  const qStatus = urlParams.get('status');

  await loadData();

  if (qProject) {
    projectFilterSelect.value = qProject;
  }
  if (qStatus) {
    statusFilterSelect.value = qStatus;
  }
  if (qProject || qStatus) {
    renderTasks();
  }
}

document.addEventListener('DOMContentLoaded', init);
