export const $ = (selector, root = document) => root.querySelector(selector);
export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
export function setPage({ title, eyebrow = "СЕМЕЙНАЯ СИСТЕМА РАЗВИТИЯ", html }) {
  $("#pageTitle").textContent = title;
  $("#topEyebrow").textContent = eyebrow;
  $("#pageContent").innerHTML = html;
}
export function toast(message) {
  const el = $("#toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2600);
}
export const formatMoney = value => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value);
export const formatDate = value => new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(value));