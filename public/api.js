const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong talking to the server.");
  }
  return data;
}

export const api = {
  getMedicines: () => request("/medicines"),
  addMedicine: (payload) => request("/medicines", { method: "POST", body: payload }),
  getDoseLogs: () => request("/doselogs"),
  markDose: (id, status) => request(`/doselogs/${id}`, { method: "PATCH", body: { status } }),
  getFamily: () => request("/family/members"),
  addFamilyMember: (payload) => request("/family/add-member", { method: "POST", body: payload }),
  deleteMedicine: (id) =>
  request(`/medicines/${id}`, {
    method: "DELETE",
  }),

  deleteDose: (id) =>
    request(`/doselogs/${id}`, {
      method: "DELETE",
    }),
};
