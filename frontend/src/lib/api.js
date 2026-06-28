export async function apiClient(url, options = {}) {
  const token = window.localStorage.getItem("apple_tree_token");

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    window.localStorage.removeItem("apple_tree_token");
    window.localStorage.removeItem("apple_tree_user");
    window.dispatchEvent(new Event("unauthorized"));
  }

  return response;
}
