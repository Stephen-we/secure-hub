const API_URL = "http://localhost:5000";

export async function apiGet(url: string) {
  const token = localStorage.getItem("securehub_token");
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());
}

export async function apiUpload(url: string, file: File) {
  const token = localStorage.getItem("securehub_token");
  const form = new FormData();
  form.append("file", file);

  return fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  }).then((res) => res.json());
}

export async function apiDelete(url: string) {
  const token = localStorage.getItem("securehub_token");

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

export async function apiDownloadFile(url: string, filename: string) {
  const token = localStorage.getItem("securehub_token");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Download failed");
  }

  const blob = await res.blob();
  const link = document.createElement("a");
  const href = URL.createObjectURL(blob);

  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}
