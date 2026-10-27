import { getProjects, createProject, updateProject, deleteProject } from './projects.js';
import { getTasks, createTask, updateTask, deleteTask } from './tasks.js';
import { logout } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const projectListEl = document.getElementById('projectList');
  const createProjectBtn = document.getElementById('createProjectBtn');
  const projectModal = document.getElementById('projectModal');
  const projectForm = document.getElementById('projectForm');
  const projectFormId = document.getElementById('projectFormId');
  const projectNameInput = document.getElementById('projectNameInput');
  const projectDescInput = document.getElementById('projectDescInput');
  const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskModal = document.getElementById('taskModal');
  const taskForm = document.getElementById('taskForm');
  const taskFormId = document.getElementById('taskFormId');
  const taskFormProjectId = document.getElementById('taskFormProjectId');
  const taskTitleInput = document.getElementById('taskTitleInput');
  const taskDescInput = document.getElementById('taskDescInput');
  const taskStatusSelect = document.getElementById('taskStatusSelect');
  const taskPrioritySelect = document.getElementById('taskPrioritySelect');
  const closeTaskModalBtn = document.getElementById('closeTaskModalBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const statTotalProjects = document.getElementById('statTotalProjects');
  const statTotalTasks = document.getElementById('statTotalTasks');
  const statInProgressTasks = document.getElementById('statInProgressTasks');
  const statCompletedTasks = document.getElementById('statCompletedTasks');

  let currentProjectId = null;

  const safeText = (txt) => document.createTextNode(txt);

  const setText = (el, txt) => { if (el) el.textContent = txt; };

  const refreshStats = async () => {
    const tasks = await getTasks();
    const projects = await getProjects();
    setText(statTotalProjects, projects.length);
    setText(statTotalTasks, tasks.length);
    setText(statInProgressTasks, tasks.filter(t => t.status === 'In Progress').length);
    setText(statCompletedTasks, tasks.filter(t => t.status === 'Done').length);
  };

// Activity log
let activityLog = [];
const recentActivityList = document.getElementById('recentActivityList');
const renderRecentActivity = () => {
  recentActivityList.innerHTML = '';
  activityLog.slice().reverse().forEach(msg => {
    const div = document.createElement('div');
    div.className = 'flex justify-between border-b border-gray-100 p-3';
    const p = document.createElement('p');
    p.className = 'text-sm';
    p.textContent = msg.text;
    const time = document.createElement('p');
    time.className = 'text-gray-400 text-xs';
    time.textContent = msg.time;
    div.append(p, time);
    recentActivityList.appendChild(div);
  });
};
const addActivity = (text) => {
  activityLog.push({ text, time: new Date().toLocaleTimeString() });
  renderRecentActivity();
};

  const renderProjects = async () => {
    const projects = await getProjects();
    projectListEl.innerHTML = '';
    projects.forEach(p => {
      const container = document.createElement('div');
      container.className = 'flex justify-between items-center p-3 border-b border-gray-200';
      const nameSpan = document.createElement('span');
      nameSpan.appendChild(safeText(p.name));
      nameSpan.className = 'font-medium';

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'flex items-center gap-3';

      const detailsLink = document.createElement('a');
      detailsLink.href = `project-details.html?id=${encodeURIComponent(p.id || p._id)}`;
      detailsLink.textContent = 'Details';
      detailsLink.className = 'text-indigo-600 hover:underline font-medium text-sm';
      actionsDiv.appendChild(detailsLink);

      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      viewBtn.textContent = 'View';
      viewBtn.className = 'text-blue-600 hover:underline';
      viewBtn.addEventListener('click', () => {
        currentProjectId = p.id || p._id;
        loadTasks(p.id || p._id);
      });

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.textContent = 'Edit';
      editBtn.className = 'text-green-600 hover:underline';
      editBtn.addEventListener('click', () => openProjectModal(p));

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.textContent = 'Delete';
      delBtn.className = 'text-red-600 hover:underline';
      delBtn.addEventListener('click', async () => {
        if (confirm(`Delete project "${p.name}"?`)) {
          await deleteProject(p.id);
          await renderProjects();
          await refreshStats();
          addActivity(`You deleted project "${p.name}"`);
        }
      });

      actionsDiv.append(viewBtn, editBtn, delBtn);
      container.append(nameSpan, actionsDiv);
      projectListEl.appendChild(container);
    });
    setText(statTotalProjects, projects.length);
  };

  const openProjectModal = (project = null) => {
    projectFormId.value = project ? project.id : '';
    projectNameInput.value = project ? project.name : '';
    projectDescInput.value = project ? project.description : '';
    projectModal.classList.remove('hidden');
  };
  const closeProjectModal = () => {
    projectForm.reset();
    projectModal.classList.add('hidden');
  };

  const openTaskModal = (projectId) => {
    taskFormId.value = '';
    taskFormProjectId.value = projectId || '';
    taskTitleInput.value = '';
    taskDescInput.value = '';
    taskStatusSelect.value = 'To Do';
    taskPrioritySelect.value = 'Medium';
    taskModal.classList.remove('hidden');
  };
  const closeTaskModal = () => {
    taskForm.reset();
    taskModal.classList.add('hidden');
  };

  // Load tasks for a project, ensuring a single container and clearing previous contents
  const loadTasks = async (projectId) => {
    const tasks = await getTasks(projectId);
    let taskContainer = document.getElementById('taskList');
    if (!taskContainer) {
      taskContainer = document.createElement('div');
      taskContainer.id = 'taskList';
      taskContainer.className = 'mt-4';
      projectListEl.parentNode.appendChild(taskContainer);
    }
    taskContainer.innerHTML = `<h3 class="font-bold mb-2">Tasks for project</h3>`;
    tasks.forEach(t => {
      const row = document.createElement('div');
      row.className = 'flex justify-between items-center p-2 border-b border-gray-100';
      const title = document.createElement('span');
      title.appendChild(safeText(t.title));
      const status = document.createElement('span');
      status.appendChild(safeText(t.status));
      const actions = document.createElement('div');
      actions.className = 'flex gap-2';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.textContent = 'Edit';
      editBtn.className = 'text-green-600 hover:underline';
      editBtn.addEventListener('click', () => openTaskEditModal(t));

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.textContent = 'Delete';
      delBtn.className = 'text-red-600 hover:underline';
      delBtn.addEventListener('click', async () => {
        if (confirm(`Delete task "${t.title}"?`)) {
          await deleteTask(t.id);
          await loadTasks(projectId);
          await refreshStats();
        }
      });

      actions.append(editBtn, delBtn);
      row.append(title, status, actions);
      taskContainer.appendChild(row);
    });
  };




  const openTaskEditModal = (task) => {
    taskFormId.value = task.id;
    taskFormProjectId.value = task.projectId;
    taskTitleInput.value = task.title;
    taskDescInput.value = task.description;
    taskStatusSelect.value = task.status;
    taskPrioritySelect.value = task.priority;
    taskModal.classList.remove('hidden');
  };

  // Event listeners
  createProjectBtn?.addEventListener('click', () => openProjectModal());
  closeProjectModalBtn?.addEventListener('click', closeProjectModal);
  addTaskBtn?.addEventListener('click', () => {
    if (!currentProjectId) {
      alert('Select a project first.');
      return;
    }
    openTaskModal(currentProjectId);
  });
  closeTaskModalBtn?.addEventListener('click', closeTaskModal);
  logoutBtn?.addEventListener('click', logout);

  projectForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { name: projectNameInput.value.trim(), description: projectDescInput.value.trim() };
    if (projectFormId.value) {
      await updateProject(projectFormId.value, data);
        addActivity(`You updated project "${data.name}"`);
    } else {
      await createProject(data);
    }
    closeProjectModal();
    await renderProjects();
    await refreshStats();
  });

  taskForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      projectId: taskFormProjectId.value,
      title: taskTitleInput.value.trim(),
      description: taskDescInput.value.trim(),
      status: taskStatusSelect.value,
      priority: taskPrioritySelect.value,
    };
    if (taskFormId.value) {
      await updateTask(taskFormId.value, data);
        addActivity(`You updated task "${data.title}"`);
    } else {
      await createTask(data);
        addActivity(`You added task "${data.title}" to project`);
    }
    closeTaskModal();
    await loadTasks(data.projectId);
    await refreshStats();
  });

  // Initial load
  renderProjects();
  refreshStats();
  renderRecentActivity();
});
