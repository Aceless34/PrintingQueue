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

export const deleteColor = (id) =>
  request(`/filament-colors/${id}`, {
    method: "DELETE",
  });

export const fetchManufacturers = () => request("/filament-manufacturers");

export const createManufacturer = (payload) =>
  request("/filament-manufacturers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const updateManufacturer = (id, payload) =>
  request(`/filament-manufacturers/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const deleteManufacturer = (id) =>
  request(`/filament-manufacturers/${id}`, {
    method: "DELETE",
  });

export const fetchMaterials = () => request("/filament-materials");

export const createMaterial = (payload) =>
  request("/filament-materials", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const updateMaterial = (id, payload) =>
  request(`/filament-materials/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const deleteMaterial = (id) =>
  request(`/filament-materials/${id}`, {
    method: "DELETE",
  });

export const fetchRolls = () => request("/filament-rolls");

export const fetchRollUsage = (id) => request(`/filament-rolls/${id}/usage`);

export const createRoll = (payload) =>
  request("/filament-rolls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const updateRoll = (id, payload) =>
  request(`/filament-rolls/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
