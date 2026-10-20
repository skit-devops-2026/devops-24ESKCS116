export const API='http://localhost:3000/api';
export const setToken=(t)=>localStorage.setItem('jwt',t);
export const getToken=()=>localStorage.getItem('jwt');
export const clearToken=()=>localStorage.removeItem('jwt');
export const headers=()=>({'Content-Type':'application/json','Authorization':`Bearer ${getToken()||''}`});
export async function signup(data){
  const r=await fetch(`${API}/auth/signup`,{method:'POST',...headers(),body:JSON.stringify(data)});
  return r.json();
}
export async function login(data){
  const r=await fetch(`${API}/auth/login`,{method:'POST',...headers(),body:JSON.stringify(data)});
  const d=await r.json();
  if(r.ok) setToken(d.token);
  return d;
}
export function logout(){clearToken();window.location.href='login.html';}
