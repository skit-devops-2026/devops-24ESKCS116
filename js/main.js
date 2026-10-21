import { signup, login, logout, getToken, getUser } from './auth.js';
import { getProjects, createProject, deleteProject, updateProject } from './projects.js';
import { getTasks, createTask, updateTask, deleteTask } from './tasks.js';

function showAlert(msg) {
  alert(msg);
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
  // Guard: unauthenticated users redirected to login
  if (!getToken()) {
    window.location.href = 'login.html';
  }

  // State
  let cachedProjects = [];
  let cachedTasks = [];
  let selectedProjectId = null;
  let searchQuery = '';

  // DOM Elements
  const projectListDiv = document.getElementById('projectList');
  const createProjectBtn = document.getElementById('createProjectBtn');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const welcomeHeading = document.getElementById('welcomeHeading');
  const userAvatar = document.getElementById('userAvatar');
  const dashboardSearchInput = document.getElementById('dashboardSearchInput');

  // Stat counters
  const statTotalTasks = document.getElementById('statTotalTasks');
  const statTotalProjects = document.getElementById('statTotalProjects');
  const statInProgressTasks = document.getElementById('statInProgressTasks');
  const statCompletedTasks = document.getElementById('statCompletedTasks');

  // Modals
  const projectModal = document.getElementById('projectModal');
  const projectModalTitle = document.getElementById('projectModalTitle');
  const projectForm = document.getElementById('projectForm');
  const projectFormId = document.getElementById('projectFormId');
  const projectNameInput = document.getElementById('projectNameInput');
  const projectDescInput = document.getElementById('projectDescInput');
  const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');

  const taskModal = document.getElementById('taskModal');
  const taskModalTitle = document.getElementById('taskModalTitle');
  const taskForm = document.getElementById('taskForm');
  const taskFormId = document.getElementById('taskFormId');
  const taskFormProjectId = document.getElementById('taskFormProjectId');
  const taskTitleInput = document.getElementById('taskTitleInput');
  const taskDescInput = document.getElementById('taskDescInput');
  const taskStatusSelect = document.getElementById('taskStatusSelect');
  const taskPrioritySelect = document.getElementById('taskPrioritySelect');
  const closeTaskModalBtn = document.getElementById('closeTaskModalBtn');

  const confirmModal = document.getElementById('confirmModal');
  const confirmModalTitle = document.getElementById('confirmModalTitle');
  const confirmModalMsg = document.getElementById('confirmModalMsg');
  const confirmModalOkBtn = document.getElementById('confirmModalOkBtn');
  const confirmModalCancelBtn = document.getElementById('confirmModalCancelBtn');

  // Display user information
  const user = getUser();
  if (user && user.name) {
    if (welcomeHeading) {
      welcomeHeading.textContent = `Welcome back, ${user.name}!`;
    }
    if (userAvatar) {
      userAvatar.textContent = user.name.charAt(0).toUpperCase();
    }
  }

  // Confirmation dialog helper
  let confirmResolver = null;
  function showConfirm(title, message) {
    if (!confirmModal) {
      return Promise.resolve(confirm(message));
    }
    confirmModalTitle.textContent = title;
    confirmModalMsg.textContent = message;
    confirmModal.classList.remove('hidden');

    return new Promise((resolve) => {
      confirmResolver = resolve;
    });
  }

  if (confirmModalOkBtn) {
    confirmModalOkBtn.addEventListener('click', () => {
      if (confirmModal) confirmModal.classList.add('hidden');
      if (confirmResolver) {
        confirmResolver(true);
        confirmResolver = null;
      }
    });
  }

  if (confirmModalCancelBtn) {
    confirmModalCancelBtn.addEventListener('click', () => {
      if (confirmModal) confirmModal.classList.add('hidden');
      if (confirmResolver) {
        confirmResolver(false);
        confirmResolver = null;
      }
    });
  }

  // Update real-time statistics
  async function updateDashboardStats() {
    try {
      const [projs, tsks] = await Promise.all([getProjects(), getTasks()]);
      cachedProjects = Array.isArray(projs) ? projs : [];
      cachedTasks = Array.isArray(tsks) ? tsks : [];

      if (statTotalProjects) statTotalProjects.textContent = cachedProjects.length;
      if (statTotalTasks) statTotalTasks.textContent = cachedTasks.length;

      const inProgress = cachedTasks.filter((t) => t.status === 'In Progress').length;
      const completed = cachedTasks.filter((t) => t.status === 'Done').length;

      if (statInProgressTasks) statInProgressTasks.textContent = inProgress;
      if (statCompletedTasks) statCompletedTasks.textContent = completed;
    } catch (err) {
      console.error('Failed to update stats:', err);
    }
  }

  // Render Projects List
  async function loadProjects() {
    if (!projectListDiv) return;

    const proj = await getProjects();
    cachedProjects = Array.isArray(proj) ? proj : [];
    projectListDiv.innerHTML = '';

    // Filter projects if search query present
    let displayList = cachedProjects;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      displayList = displayList.filter(
        (p) => (p.name && p.name.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (displayList.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'p-6 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 my-2';
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'text-sm font-medium';
      emptyMsg.textContent = searchQuery ? 'No matching projects found.' : 'No projects yet. Create your first project!';
      emptyDiv.appendChild(emptyMsg);

      if (!searchQuery) {
        const createFirstBtn = document.createElement('button');
        createFirstBtn.className = 'mt-3 inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition';
        createFirstBtn.textContent = '+ Create Project';
        createFirstBtn.addEventListener('click', () => openProjectModal());
        emptyDiv.appendChild(createFirstBtn);
      }

      projectListDiv.appendChild(emptyDiv);
      return;
    }

    displayList.forEach((p) => {
      const isSelected = String(selectedProjectId) === String(p.id);
      const div = document.createElement('div');
      div.className = `p-3.5 mb-2 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition ${
        isSelected ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
      }`;

      // Left container: Name and description
      const leftContainer = document.createElement('div');
      leftContainer.className = 'flex-1 min-w-0';

      const nameRow = document.createElement('div');
      nameRow.className = 'flex items-center gap-2';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'font-semibold text-gray-900 text-sm truncate';
      nameSpan.textContent = p.name;
      nameRow.appendChild(nameSpan);

      if (isSelected) {
        const activeBadge = document.createElement('span');
        activeBadge.className = 'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-200 text-blue-800';
        activeBadge.textContent = 'Active';
        nameRow.appendChild(activeBadge);
      }
      leftContainer.appendChild(nameRow);

      if (p.description) {
        const descP = document.createElement('p');
        descP.className = 'text-xs text-gray-500 mt-0.5 line-clamp-2';
        descP.textContent = p.description;
        leftContainer.appendChild(descP);
      }
      div.appendChild(leftContainer);

      // Right container: Action buttons
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'flex items-center gap-1.5 shrink-0';

      // View Tasks Button
      const viewBtn = document.createElement('button');
      viewBtn.className = `text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
        isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      }`;
      viewBtn.textContent = isSelected ? 'Tasks Open' : 'View Tasks';
      viewBtn.addEventListener('click', async () => {
        selectedProjectId = p.id;
        await loadProjects();
        await loadTasks(p.id);
      });
      actionsDiv.appendChild(viewBtn);

      // Edit Project Button
      const editBtn = document.createElement('button');
      editBtn.className = 'text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
        openProjectModal(p);
      });
      actionsDiv.appendChild(editBtn);

      // Delete Project Button
      const delBtn = document.createElement('button');
      delBtn.className = 'text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', async () => {
        const ok = await showConfirm('Delete Project', `Are you sure you want to delete "${p.name}" and all its tasks?`);
        if (ok) {
          await deleteProject(p.id);
          if (String(selectedProjectId) === String(p.id)) {
            selectedProjectId = null;
            const oldTaskList = document.getElementById('taskList');
            if (oldTaskList) oldTaskList.remove();
          }
          await loadProjects();
          await updateDashboardStats();
        }
      });
      actionsDiv.appendChild(delBtn);

      div.appendChild(actionsDiv);
      projectListDiv.appendChild(div);
    });
  }

  // Render Tasks for a Project
  async function loadTasks(projectId) {
    if (!projectListDiv) return;

    const currentProject = cachedProjects.find((p) => String(p.id) === String(projectId));
    const tasks = await getTasks(projectId);
    cachedTasks = Array.isArray(tasks) ? tasks : [];

    const taskDiv = document.createElement('div');
    taskDiv.id = 'taskList';
    taskDiv.className = 'mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200';

    // Header with project name and "+ Add Task" button
    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-3 border-b border-gray-200';

    const headerLeft = document.createElement('div');
    const headerTitle = document.createElement('h3');
    headerTitle.className = 'font-bold text-gray-800 text-sm uppercase tracking-wide';
    headerTitle.textContent = currentProject ? `Tasks — ${currentProject.name}` : 'Project Tasks';
    headerLeft.appendChild(headerTitle);

    const countSpan = document.createElement('span');
    countSpan.className = 'text-xs text-gray-400 block mt-0.5';
    countSpan.textContent = `Total tasks: ${cachedTasks.length}`;
    headerLeft.appendChild(countSpan);
    headerDiv.appendChild(headerLeft);

    const addTaskHeaderBtn = document.createElement('button');
    addTaskHeaderBtn.className = 'text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition flex items-center gap-1';
    addTaskHeaderBtn.textContent = '+ Add Task';
    addTaskHeaderBtn.addEventListener('click', () => {
      openTaskModal(null, projectId);
    });
    headerDiv.appendChild(addTaskHeaderBtn);

    taskDiv.appendChild(headerDiv);

    // Filter tasks if search query present
    let displayTasks = cachedTasks;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      displayTasks = displayTasks.filter(
        (t) => (t.title && t.title.toLowerCase().includes(q)) || (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (displayTasks.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'p-6 text-center text-gray-400 bg-white rounded-lg border border-dashed border-gray-200 my-2';
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'text-sm font-medium';
      emptyMsg.textContent = searchQuery ? 'No matching tasks found.' : 'No tasks in this project yet.';
      emptyDiv.appendChild(emptyMsg);

      if (!searchQuery) {
        const createFirstTaskBtn = document.createElement('button');
        createFirstTaskBtn.className = 'mt-3 inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition';
        createFirstTaskBtn.textContent = '+ Add first task';
        createFirstTaskBtn.addEventListener('click', () => openTaskModal(null, projectId));
        emptyDiv.appendChild(createFirstTaskBtn);
      }
      taskDiv.appendChild(emptyDiv);
    } else {
      displayTasks.forEach((t) => {
        const tDiv = document.createElement('div');
        tDiv.className = 'p-3 mb-2 bg-white border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs hover:border-gray-300 transition';

        // Left section: Title, badges, description
        const infoDiv = document.createElement('div');
        infoDiv.className = 'flex-1 min-w-0';

        const titleRow = document.createElement('div');
        titleRow.className = 'flex flex-wrap items-center gap-2';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'font-semibold text-gray-900 text-sm';
        titleSpan.textContent = t.title;
        titleRow.appendChild(titleSpan);

        // Status select dropdown (single-click update)
        const statusSelect = document.createElement('select');
        statusSelect.className = `text-xs font-medium px-2 py-0.5 rounded-md border focus:outline-none transition cursor-pointer ${
          t.status === 'Done'
            ? 'bg-green-50 text-green-700 border-green-200'
            : t.status === 'In Progress'
            ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
            : 'bg-gray-100 text-gray-700 border-gray-200'
        }`;

        ['To Do', 'In Progress', 'Done'].forEach((statusOpt) => {
          const opt = document.createElement('option');
          opt.value = statusOpt;
          opt.textContent = statusOpt;
          if (t.status === statusOpt) opt.selected = true;
          statusSelect.appendChild(opt);
        });

        statusSelect.addEventListener('change', async (e) => {
          const newStatus = e.target.value;
          await updateTask(t.id, { status: newStatus });
          t.status = newStatus;
          await updateDashboardStats();
          if (selectedProjectId) await loadTasks(selectedProjectId);
        });
        titleRow.appendChild(statusSelect);

        // Priority badge
        const prioritySpan = document.createElement('span');
        const prio = t.priority || 'Medium';
        prioritySpan.className = `text-xs font-semibold px-2 py-0.5 rounded-full ${
          prio === 'High'
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : prio === 'Medium'
            ? 'bg-purple-50 text-purple-700 border border-purple-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`;
        prioritySpan.textContent = prio;
        titleRow.appendChild(prioritySpan);

        infoDiv.appendChild(titleRow);

        if (t.description) {
          const descP = document.createElement('p');
          descP.className = 'text-xs text-gray-500 mt-1';
          descP.textContent = t.description;
          infoDiv.appendChild(descP);
        }
        tDiv.appendChild(infoDiv);

        // Right section: Edit and Delete buttons
        const actionBtns = document.createElement('div');
        actionBtns.className = 'flex items-center gap-1.5 shrink-0';

        const editBtn = document.createElement('button');
        editBtn.className = 'text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => {
          openTaskModal(t, projectId);
        });
        actionBtns.appendChild(editBtn);

        const delTaskBtn = document.createElement('button');
        delTaskBtn.className = 'text-xs font-semibold px-2.5 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition';
        delTaskBtn.textContent = 'Del';
        delTaskBtn.addEventListener('click', async () => {
          const ok = await showConfirm('Delete Task', `Are you sure you want to delete task "${t.title}"?`);
          if (ok) {
            await deleteTask(t.id);
            await updateDashboardStats();
            if (selectedProjectId) await loadTasks(selectedProjectId);
          }
        });
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

  // Project Modal open helper
  function openProjectModal(project = null) {
    if (!projectModal) return;
    if (project) {
      projectModalTitle.textContent = 'Edit Project';
      projectFormId.value = project.id;
      projectNameInput.value = project.name || '';
      projectDescInput.value = project.description || '';
    } else {
      projectModalTitle.textContent = 'Create New Project';
      projectFormId.value = '';
      projectNameInput.value = '';
      projectDescInput.value = '';
    }
    projectModal.classList.remove('hidden');
    projectNameInput.focus();
  }

  function closeProjectModal() {
    if (projectModal) projectModal.classList.add('hidden');
  }

  if (closeProjectModalBtn) {
    closeProjectModalBtn.addEventListener('click', closeProjectModal);
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  // Project Form Submit Handler
  if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = projectFormId.value;
      const name = projectNameInput.value.trim();
      const description = projectDescInput.value.trim();

      if (!name) return;

      if (id) {
        // Edit existing project
        await updateProject(id, { name, description });
      } else {
        // Create new project
        const newProj = await createProject({ name, description });
        if (newProj && newProj.id) {
          selectedProjectId = newProj.id;
        }
      }

      closeProjectModal();
      await updateDashboardStats();
      await loadProjects();
      if (selectedProjectId) {
        await loadTasks(selectedProjectId);
      }
    });
  }

  // Task Modal open helper
  function openTaskModal(task = null, projectId = null) {
    if (!taskModal) return;
    const targetProjectId = projectId || selectedProjectId;

    if (!targetProjectId) {
      showAlert('Please select or create a project first before adding tasks.');
      return;
    }

    taskFormProjectId.value = targetProjectId;

    if (task) {
      taskModalTitle.textContent = 'Edit Task';
      taskFormId.value = task.id;
      taskTitleInput.value = task.title || '';
      taskDescInput.value = task.description || '';
      taskStatusSelect.value = task.status || 'To Do';
      taskPrioritySelect.value = task.priority || 'Medium';
    } else {
      taskModalTitle.textContent = 'Add New Task';
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
    if (taskModal) taskModal.classList.add('hidden');
  }

  if (closeTaskModalBtn) {
    closeTaskModalBtn.addEventListener('click', closeTaskModal);
  }

  if (taskModal) {
    taskModal.addEventListener('click', (e) => {
      if (e.target === taskModal) closeTaskModal();
    });
  }

  // Task Form Submit Handler
  if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = taskFormId.value;
      const targetProjectId = taskFormProjectId.value || selectedProjectId;
      const title = taskTitleInput.value.trim();
      const description = taskDescInput.value.trim();
      const status = taskStatusSelect.value;
      const priority = taskPrioritySelect.value;

      if (!title || !targetProjectId) return;

      if (id) {
        // Edit existing task
        await updateTask(id, { title, description, status, priority });
      } else {
        // Create new task
        await createTask({
          projectId: targetProjectId,
          title,
          description,
          status,
          priority,
        });
      }

      closeTaskModal();
      await updateDashboardStats();
      if (selectedProjectId) {
        await loadTasks(selectedProjectId);
      }
    });
  }

  // Quick Action Sidebar Buttons
  if (createProjectBtn) {
    createProjectBtn.addEventListener('click', () => {
      openProjectModal();
    });
  }

  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      if (!selectedProjectId && cachedProjects.length > 0) {
        selectedProjectId = cachedProjects[0].id;
      }
      openTaskModal(null, selectedProjectId);
    });
  }

  // Search input live filter
  if (dashboardSearchInput) {
    dashboardSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      loadProjects();
      if (selectedProjectId) {
        loadTasks(selectedProjectId);
      }
    });
  }

  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
    });
  }

  // Initial load
  (async function initDashboard() {
    await updateDashboardStats();
    await loadProjects();
    // Auto-select first project if available
    if (cachedProjects.length > 0 && !selectedProjectId) {
      selectedProjectId = cachedProjects[0].id;
      await loadProjects();
      await loadTasks(selectedProjectId);
    }
  })();
}
