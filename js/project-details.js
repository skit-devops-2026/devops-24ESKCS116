import { getToken, getUser, logout } from './auth.js';
import { getProjects } from './projects.js';
import { getTasks, createTask, updateTask, deleteTask } from './tasks.js';

const $ = id => document.getElementById(id);
const idOf = item => String(item?.id ?? item?._id ?? '');
const projectIdOf = task => String(task.projectId ?? task.project?._id ?? task.project?.id ?? task.project ?? '');
let project = null;
let tasks = [];

function message(text, type='success') {
  const root = $('projectMessage'); root.replaceChildren();
  if (!text) return;
  const el = document.createElement('div');
  el.className = `toast-message ${type === 'error' ? 'toast-error' : 'toast-success'}`;
  el.textContent = text; root.append(el);
}
function badge(value, kind) {
  const el = document.createElement('span');
  const slug = value === 'In Progress' ? 'progress' : String(value || '').toLowerCase();
  el.className = `${kind}-pill ${kind === 'status' ? `status-${slug}` : `priority-${slug}`}`;
  el.textContent = value || '—'; return el;
}
function btn(label, cls, fn) {
  const el = document.createElement('button'); el.type='button'; el.className=cls; el.textContent=label; el.addEventListener('click',fn); return el;
}
function openModal(task=null) {
  $('taskFormId').value = task ? idOf(task) : '';
  $('taskModalTitle').textContent = task ? 'Edit task' : 'Add a task';
  $('taskTitleInput').value = task?.title || '';
  $('taskDescInput').value = task?.description || '';
  $('taskStatusSelect').value = task?.status || 'To Do';
  $('taskPrioritySelect').value = task?.priority || 'Medium';
  $('taskFormError').textContent = '';
  $('taskModal').hidden = false; $('taskTitleInput').focus();
}
function closeModal() { $('taskModal').hidden = true; }
function render() {
  const done = tasks.filter(t=>t.status==='Done').length;
  const progress = tasks.filter(t=>t.status==='In Progress').length;
  const todo = tasks.filter(t=>!t.status || t.status==='To Do').length;
  const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  $('totalTasks').textContent=tasks.length; $('todoTasks').textContent=todo;
  $('progressTasks').textContent=progress; $('doneTasks').textContent=done;
  $('progressLabel').textContent=`${percent}%`; $('progressBar').style.width=`${percent}%`;
  const list=$('projectTaskList'); list.replaceChildren();
  if (!tasks.length) {
    const empty=document.createElement('div'); empty.className='empty-state col-span-full';
    const h=document.createElement('p'); h.className='font-bold text-slate-700'; h.textContent='No tasks in this project yet';
    const p=document.createElement('p'); p.className='text-sm mt-2'; p.textContent='Add your first task and track its progress here.';
    empty.append(h,p,btn('＋ Add first task','btn-primary rounded-xl px-4 py-2 mt-4 text-sm font-bold',()=>openModal())); list.append(empty); return;
  }
  tasks.forEach(task=>{
    const card=document.createElement('article'); card.className='task-card';
    const top=document.createElement('div'); top.className='flex items-start justify-between gap-3';
    const title=document.createElement('h3'); title.className='font-extrabold break-words'; title.textContent=task.title||'Untitled task';
    const actions=document.createElement('div'); actions.className='flex gap-2 shrink-0';
    actions.append(btn('Edit','text-xs font-bold text-violet-600 hover:underline',()=>openModal(task)));
    actions.append(btn('Delete','text-xs font-bold text-rose-600 hover:underline',async()=>{
      if(!confirm(`Delete task "${task.title}"?`))return;
      if(!await deleteTask(idOf(task))){message('Task could not be deleted. Please try again.','error');return;}
      tasks=tasks.filter(t=>idOf(t)!==idOf(task));render();message('Task deleted.');
    }));
    top.append(title,actions);
    const desc=document.createElement('p');desc.className='text-sm text-slate-500 mt-3';desc.textContent=task.description||'No description provided.';
    const bottom=document.createElement('div');bottom.className='flex items-center justify-between gap-3 flex-wrap mt-4 pt-3 border-t border-slate-100';
    const badges=document.createElement('div');badges.className='flex gap-2 flex-wrap';badges.append(badge(task.status,'status'),badge(task.priority,'priority'));
    const select=document.createElement('select');select.className='field-control !w-auto !py-1.5 !text-xs';select.setAttribute('aria-label',`Change status for ${task.title}`);
    ['To Do','In Progress','Done'].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;o.selected=task.status===v;select.append(o);});
    select.addEventListener('change',async()=>{
      const result=await updateTask(idOf(task),{title:task.title,description:task.description||'',status:select.value,priority:task.priority||'Medium',projectId:idOf(project)});
      if(!result||result.error||result.success===false){message('Status could not be updated.','error');select.value=task.status;return;}
      task.status=select.value;render();message('Task status updated.');
    });
    bottom.append(badges,select);card.append(top,desc,bottom);list.append(card);
  });
}
async function init() {
  if(!getToken()){window.location.href='login.html';return;}
  $('logoutBtn').addEventListener('click',logout);
  const user=getUser();$('userAvatar').textContent=String(user?.name||user?.email||'D').trim().charAt(0).toUpperCase();
  $('addTaskBtn').addEventListener('click',()=>openModal());
  $('closeTaskModalBtn').addEventListener('click',closeModal);$('cancelTaskBtn').addEventListener('click',closeModal);
  $('taskModal').addEventListener('click',e=>{if(e.target===$('taskModal'))closeModal();});
  $('taskForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const data={title:$('taskTitleInput').value.trim(),description:$('taskDescInput').value.trim(),status:$('taskStatusSelect').value,priority:$('taskPrioritySelect').value,projectId:idOf(project)};
    if(!data.title){$('taskFormError').textContent='Task title is required.';return;}
    const id=$('taskFormId').value;
    const result=id?await updateTask(id,data):await createTask(data);
    if(!result||result.error||result.success===false){$('taskFormError').textContent=result?.error||result?.message||'Could not save the task.';return;}
    closeModal();tasks=await getTasks(idOf(project));render();message(id?'Task updated.':'Task created.');
  });
  const params=new URLSearchParams(window.location.search);const projectId=params.get('id');
  if(!projectId){$('projectName').textContent='Project not selected';$('projectDescription').textContent='Return to Projects and choose a project to view its details.';$('projectTaskList').innerHTML='<div class="empty-state col-span-full">No project ID was provided.</div>';$('addTaskBtn').disabled=true;return;}
  const [projects,allTasks]=await Promise.all([getProjects(),getTasks()]);
  project=(Array.isArray(projects)?projects:[]).find(p=>idOf(p)===projectId);
  if(!project){$('projectName').textContent='Project not found';$('projectDescription').textContent='This project may have been deleted or may not be accessible.';$('projectTaskList').innerHTML='<div class="empty-state col-span-full">Project details could not be loaded. <a class="text-violet-600 font-bold" href="dashboard.html#projectsSection">Back to Projects</a></div>';$('addTaskBtn').disabled=true;return;}
  $('projectName').textContent=project.name||'Untitled project';$('projectDescription').textContent=project.description||'No description has been added for this project yet.';
  tasks=(Array.isArray(allTasks)?allTasks:[]).filter(t=>projectIdOf(t)===projectId);
  render();
}
init().catch(()=>message('Could not load this project. Please refresh and try again.','error'));
