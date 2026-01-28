const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, options);
  const payload = res.status === 204 ? null : await res.json();
  if (!res.ok) {
    const message = payload?.error || "Request failed";
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return payload;
};

export const fetchProjects = (includeArchived) =>
  request(`/projects?includeArchived=${includeArchived ? "1" : "0"}`);

export const createProject = (payload) =>
  request("/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const updateProject = (id, payload) =>
  request(`/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const deleteProject = (id) =>
  request(`/projects/${id}`, {
    method: "DELETE",
  });

export const fetchColors = () => request("/filament-colors");

export const createColor = (payload) =>
  request("/filament-colors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const updateColor = (id, payload) =>
  request(`/filament-colors/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
