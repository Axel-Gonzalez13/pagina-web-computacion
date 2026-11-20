const CONFIG = { SUPABASE_URL: "https://hkfvtfyyhepaldqtouxy.supabase.co", SUPABASE_KEY: "sb_publishable_gGera0U-nwWLAwcwH8ZpQg_9R4Aefjg" };
const $ = (s) => document.querySelector(s);


const slides = [...document.querySelectorAll(".slide")], dots = $("#dots");
let cur = 0, timer;
slides.forEach((_, i) => { const b = document.createElement("button"); b.setAttribute("aria-label", "Diapositiva " + (i + 1)); b.onclick = () => go(i); dots.append(b); });
function go(i) {
  cur = (i + slides.length) % slides.length;
  slides.forEach((s, k) => s.classList.toggle("on", k === cur));
  [...dots.children].forEach((d, k) => d.classList.toggle("on", k === cur));
  clearInterval(timer);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(() => go(cur + 1), 5000);
}
$("#prev").onclick = () => go(cur - 1);
$("#next").onclick = () => go(cur + 1);
go(0);


$("#burger").onclick = () => $("#menu").classList.toggle("open");
$("#menu").onclick = () => $("#menu").classList.remove("open");


const MATERIAS = ["Cálculo", "Álgebra lineal", "Física", "Matemáticas discretas", "Introducción a la programación", "Programación orientada a objetos",
  "Estructuras de datos", "Arquitectura de computadoras", "Sistemas operativos", "Bases de datos", "Redes de computadoras", "Ingeniería de software",
  "Programación web", "Análisis de algoritmos", "Teoría de la computación", "Compiladores", "Inteligencia artificial", "Seguridad informática",
  "Sistemas distribuidos", "Computación en la nube", "Desarrollo móvil", "Gestión de proyectos TI", "Ética profesional", "Proyecto de grado"];
const MOD = { presencial: { n: "Presencial", p: 8, u: "Semestre" }, semi: { n: "Semipresencial", p: 6, u: "Período" }, linea: { n: "En línea", p: 4, u: "Bloque" } };
function plan(k) {
  const { p, u } = MOD[k], size = MATERIAS.length / p;
  $("#plan-out").innerHTML = Array.from({ length: p }, (_, i) =>
    `<article class="card"><h3>${u} ${i + 1}</h3><ul>${MATERIAS.slice(i * size, (i + 1) * size).map((m) => `<li>${m}</li>`).join("")}</ul></article>`).join("");
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.k === k));
}
$("#tabs").innerHTML = Object.entries(MOD).map(([k, v]) => `<button data-k="${k}">${v.n}</button>`).join("");
$("#tabs").onclick = (e) => e.target.dataset.k && plan(e.target.dataset.k);
plan("presencial");


const ok = CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY;

const H = { apikey: CONFIG.SUPABASE_KEY, "Content-Type": "application/json" };
const API = CONFIG.SUPABASE_URL + "/rest/v1/comentarios";
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");

async function cargar() {
  let d = [];
  try { d = ok ? await (await fetch(API + "?select=nombre,calificacion,mensaje,created_at&order=created_at.desc&limit=6", { headers: H })).json() : JSON.parse(localStorage.getItem("c") || "[]"); } catch {}
  $("#lista").innerHTML = (Array.isArray(d) ? d : []).map((c) =>
    `<blockquote class="card"><p>“${esc(c.mensaje)}”</p><cite>${esc(c.nombre)} · ${"★".repeat(Number(c.calificacion) || 0)}</cite></blockquote>`).join("");
}
$("#form").onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target, s = $("#estado");
  const b = { nombre: f.nombre.value.trim(), email: f.email.value.trim(), calificacion: +f.calificacion.value, mensaje: f.mensaje.value.trim() };
  s.textContent = "Enviando…";
  try {
    if (ok) {
      const r = await fetch(API, { method: "POST", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify(b) });
      if (!r.ok) throw new Error(r.status);
    } else {
      localStorage.setItem("c", JSON.stringify([b, ...JSON.parse(localStorage.getItem("c") || "[]")]));
    }
    f.reset();
    s.textContent = ok ? "Comentario guardado. ¡Gracias!" : "Modo de prueba: se guardó solo en este navegador. Configura la base de datos en app.js.";
    cargar();
  } catch { s.textContent = "No se pudo guardar. Revisa la URL, la clave y las políticas de la tabla."; }
};
cargar();
