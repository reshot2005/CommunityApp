const TOKEN_KEY = "token";
const ROLE_KEY = "role";
const USER_ID_KEY = "userId";
const USER_KEY = "user";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function getStoredUserId() {
  return localStorage.getItem(USER_ID_KEY);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setStoredRole(role) {
  localStorage.setItem(ROLE_KEY, role);
}

export function setStoredUserId(userId) {
  localStorage.setItem(USER_ID_KEY, userId);
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function setStoredAuth({ token, role, userId, user }) {
  if (token) {
    setStoredToken(token);
  }

  if (role) {
    setStoredRole(role);
  }

  if (userId) {
    setStoredUserId(userId);
  }

  if (user) {
    setStoredUser(user);
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_KEY);
}
