
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

async function request(path, body) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot connect to the server. Please try again.");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export function checkApiHealth() {
  return fetch(`${API_URL}/api/health`).then(async (response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "API request failed");
    return data;
  });
}

export function registerUser({ fullName, email, password, role }) {
  return request("/api/auth/register", { fullName, email, password, role });
}

export function loginUser({ email, password }) {
  return request("/api/auth/login", { email, password });
}

export async function getJobs() {
  let response;

  try {
    response = await fetch(`${API_URL}/api/jobs`);
  } catch {
    throw new Error("Cannot connect to the server. Please try again.");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load jobs.");
  }

  return data.jobs;
}
