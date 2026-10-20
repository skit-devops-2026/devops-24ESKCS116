import { signup, login, logout, getToken } from './auth.js';
import { getProjects, createProject, deleteProject, updateProject } from './projects.js';
import { getTasks, createTask, updateTask, deleteTask } from './tasks.js';

function showAlert(msg, ok=true){
  alert(msg);
}

// ---------- Auth pages ----------
const signupForm = document.getElementById('signupForm');
if(signupForm){
  signupForm.addEventListener('submit', async e=>{
    e.preventDefault();
    const data = {
      name: e.target.name.value.trim(),
      email: e.target.email.value.trim(),
      password: e.target.password.value,
    };
    const res = await signup(data);
    if(res.success){
      showAlert('Signup successful! Please log in.');
      window.location.href='login.html';
    } else {
      showAlert(res.message||'Signup failed');
    }
  });
}

const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', async e=>{
    e.preventDefault();
    const data = { email:e.target.email.value.trim(), password:e.target.password.value };
    const res = await login(data);
    if(res.token){
      window.location.href='dashboard.html';
    } else {
      showAlert(res.message||'Login failed');
    }
  });
}

// ---------- Dashboard ----------
if(document.body.classList.contains('dashboard') || document.getElementById('projectList')){
  let selectedProjectId = null;
  const projectListDiv = document.getElementById('projectList');
  const createProjectBtn = document.getElementById('createProjectBtn');
  const addTaskBtn = document.getElementById('addTaskBtn');

  async function loadProjects(){
    const proj = await getProjects();
    projectListDiv.innerHTML = '';
    proj.forEach(p=>{
      const div = document.createElement('div');
      div.className='p-2 border-b flex justify-between items-center';
      div.innerHTML = `<span>${p.name}</span><div><button class="text-sm text-blue-500" data-id="${p.id}" data-action="view">View Tasks</button> <button class="text-sm text-red-500" data-id="${p.id}" data-action="delete">Delete</button></div>`;
      projectListDiv.appendChild(div);
    });
  }

  async function loadTasks(projectId){
    const tasks = await getTasks(projectId);
    const taskDiv = document.createElement('div');
    taskDiv.id='taskList';
    taskDiv.className='mt-4';
    taskDiv.innerHTML = '<h3 class="font-bold mb-2">Tasks</h3>';
    tasks.forEach(t=>{
      const tDiv = document.createElement('div');
      tDiv.className='p-2 border flex justify-between items-center';
      tDiv.innerHTML = `<span>${t.title} [${t.status||'To Do'} / ${t.priority||'Low'}]</span>`+
        `<div><button class="text-sm text-green-500" data-id="${t.id}" data-action="edit">Edit</button> <button class="text-sm text-red-500" data-id="${t.id}" data-action="delete">Del</button></div>`;
      taskDiv.appendChild(tDiv);
    });
    // replace or append
    const old = document.getElementById('taskList');
    if(old) old.replaceWith(taskDiv); else projectListDiv.appendChild(taskDiv);
  }

  if(createProjectBtn){
    createProjectBtn.addEventListener('click', async()=>{
      const name = prompt('Project name:');
      if(!name) return;
      await createProject({name});
      await loadProjects();
    });
  }

  if(addTaskBtn){
    addTaskBtn.addEventListener('click', async()=>{
      if(!selectedProjectId){
        alert('Select a project first (View Tasks).');
        return;
      }
      const title = prompt('Task title:');
      if(!title) return;
      await createTask({projectId:selectedProjectId, title, status:'To Do', priority:'Low'});
      await loadTasks(selectedProjectId);
    });
  }

  // delegate clicks for project list actions
  projectListDiv.addEventListener('click', async e=>{
    const btn = e.target;
    if(btn.dataset && btn.dataset.id){
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if(action==='view'){
        selectedProjectId = id;
        await loadTasks(id);
      } else if(action==='delete'){
        if(confirm('Delete this project?')){
          await deleteProject(id);
          if(selectedProjectId===id) selectedProjectId=null;
          await loadProjects();
          const oldTaskDiv=document.getElementById('taskList'); if(oldTaskDiv) oldTaskDiv.remove();
        }
      }
    }
  });

  // delegate task actions
  projectListDiv.addEventListener('click', async e=>{
    const btn = e.target;
    if(btn.dataset && btn.dataset.action && btn.dataset.id && btn.dataset.action!=='view' && btn.dataset.action!=='delete'){
      const taskId = btn.dataset.id;
      const action = btn.dataset.action;
      if(action==='delete'){
        if(confirm('Delete task?')){ await deleteTask(taskId); await loadTasks(selectedProjectId); }
      } else if(action==='edit'){
        const newTitle = prompt('New title:');
        if(newTitle){ await updateTask(taskId,{title:newTitle}); await loadTasks(selectedProjectId); }
      }
    }
  });

  // logout button (if exists)
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn){ logoutBtn.addEventListener('click',()=>{ logout(); }); }

  // initial load
  loadProjects();
}
