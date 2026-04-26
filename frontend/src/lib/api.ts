import { getAuthHeaders } from "./auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function uploadReceipt(file: File) {
  const formData = new FormData();
  formData.append("receipt", file);

  const res = await fetch(`${API_URL}/api/receipts/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) throw new Error("Chyba pri nahrávaní");
  return res.json();
}

export async function getReceipts() {
  const res = await fetch(`${API_URL}/api/receipts`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Chyba pri načítaní");
  return res.json();
}

export async function getReceipt(id: string) {
  const res = await fetch(`${API_URL}/api/receipts/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Bloček nenájdený");
  return res.json();
}

export async function updateReceipt(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/api/receipts/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Chyba pri aktualizácii");
  return res.json();
}

export async function deleteReceipt(id: string) {
  const res = await fetch(`${API_URL}/api/receipts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Chyba pri mazaní");
}

export async function rescanReceipt(file: File, receiptId: string) {
  const formData = new FormData();
  formData.append("receipt", file);
  formData.append("receiptId", receiptId);

  const res = await fetch(`${API_URL}/api/receipts/rescan`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) throw new Error("Chyba pri opätovnom skenovaní");
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API_URL}/api/categories`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Chyba pri načítaní kategórií");
  return res.json();
}

export async function createCategory(data: { name: string; color: string }) {
  const res = await fetch(`${API_URL}/api/categories`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Chyba pri vytváraní kategórie");
  return res.json();
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${API_URL}/api/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Chyba pri mazaní kategórie");
}
