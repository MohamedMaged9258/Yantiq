// auth.js — Mock authentication (localStorage only)
import { authAPI, childrenAPI } from '../utils/api.js';
import { setState, getState, storage } from '../utils/storage.js';
import { toast } from '../utils/animations.js';

export async function login(email, password) {
  const res = await authAPI.login({ email, password });
  const { accessToken, user } = res.data.data;
  setState('accessToken', accessToken);
  setState('currentUser', user);
  return user;
}

export async function register(formData) {
  const res = await authAPI.register(formData);
  const loginRes = await authAPI.login({ email: formData.email, password: formData.password });
  setState('accessToken', loginRes.data.data.accessToken);
  setState('currentUser', loginRes.data.data.user);
  return res.data.data;
}

export async function logout() {
  setState('accessToken', null);
  setState('currentUser', null);
  setState('activeChild', null);
  storage.remove('rewards_state');
  window.location.href = '/index.html';
}

export async function refreshToken() {
  return 'mock-token';
}

export async function createChildProfile(data) {
  const res = await childrenAPI.create(data);
  const child = res.data.data;
  setState('activeChild', child);
  return child;
}

export async function loadChildren() {
  const res = await childrenAPI.list();
  const children = res.data.data;
  if (children.length > 0 && !getState('activeChild')) {
    setState('activeChild', children[0]);
  }
  return children;
}

export function setActiveChild(child) {
  setState('activeChild', child);
}

export function requireAuth(redirectTo = '/src/pages/login.html') {
  // In prototype mode: always allow access
  return true;
}

export function currentUser() {
  return getState('currentUser') || { id: 'u1', email: 'demo@yantiq.app', name: 'Parent' };
}

export function activeChild() {
  return getState('activeChild') || {
    id: 'c1', name: 'Layla', nickname: 'Layla', age: 5,
    avatar: '🌸', totalStars: 24, streakDays: 3,
  };
}
