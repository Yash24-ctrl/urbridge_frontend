const USER_STORAGE_KEY = "user";
export const AUTH_SESSION_EVENT = "auth-session-changed";

function removeStoredUserSilently() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(USER_STORAGE_KEY);
}

function dispatchAuthSessionChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "="
    );

    return JSON.parse(window.atob(paddedPayload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token || typeof token !== "string") {
    return true;
  }

  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}

export function normalizeUser(userData) {
  if (!userData || typeof userData !== "object") {
    return null;
  }

  const token =
    typeof userData.token === "string" ? userData.token.trim() : "";

  if (!token || isTokenExpired(token)) {
    return null;
  }

  return {
    ...userData,
    token,
  };
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(USER_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(storedValue);
    const normalizedUser = normalizeUser(parsedUser);

    if (!normalizedUser) {
      removeStoredUserSilently();
      return null;
    }

    return normalizedUser;
  } catch {
    removeStoredUserSilently();
    return null;
  }
}

export function getStoredToken() {
  return getStoredUser()?.token || null;
}

export function storeUser(userData) {
  if (typeof window === "undefined") {
    return null;
  }

  const normalizedUser = normalizeUser(userData);

  if (!normalizedUser) {
    removeStoredUserSilently();
    dispatchAuthSessionChange();
    return null;
  }

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
  dispatchAuthSessionChange();
  return normalizedUser;
}

export function clearStoredUser() {
  removeStoredUserSilently();
  dispatchAuthSessionChange();
}
