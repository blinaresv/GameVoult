const API_URL = "https://game-list-api-rjqftd4irq-uc.a.run.app/api";

let videojuegos = [];
let categorias  = [];
let plataformas = [];
let editandoId  = null;

const form         = document.getElementById("game-form");
const gamesList    = document.getElementById("games-list");
const emptyMsg     = document.getElementById("empty-msg");
const categoriaSelect  = document.getElementById("categoriaId");
const plataformaSelect = document.getElementById("plataformaId");
const searchInput  = document.getElementById("search-input");
const filterEstado = document.getElementById("filter-estado");
const filterCat    = document.getElementById("filter-category");
const clearSearchBtn  = document.getElementById("clear-search");
const clearFiltersBtn = document.getElementById("clear-filters-btn");
const resultsCount    = document.getElementById("results-count");

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([cargarCategorias(), cargarPlataformas()]);
  await cargarVideojuegos();

  document.getElementById("reload-btn").addEventListener("click", cargarVideojuegos);
  document.getElementById("cancel-btn").addEventListener("click", resetForm);

  searchInput.addEventListener("input", () => {
    clearSearchBtn.style.display = searchInput.value ? "block" : "none";
    renderizar();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearSearchBtn.style.display = "none";
    renderizar();
  });

  filterEstado.addEventListener("change", renderizar);
  filterCat.addEventListener("change", renderizar);

  clearFiltersBtn.addEventListener("click", limpiarFiltros);
});

async function cargarCategorias() {
  const res = await fetch(`${API_URL}/categorias`);
  categorias = await res.json();

  categoriaSelect.innerHTML = '<option value="">Sin categoría</option>';
  filterCat.innerHTML = '<option value="">Todas las categorías</option>';
  categorias.forEach(c => {
    categoriaSelect.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
    filterCat.innerHTML      += `<option value="${c.id}">${c.nombre}</option>`;
  });
}

async function cargarPlataformas() {
  const res = await fetch(`${API_URL}/plataformas`);
  plataformas = await res.json();

  plataformaSelect.innerHTML = '<option value="">Sin plataforma</option>';
  plataformas.forEach(p => {
    plataformaSelect.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
  });
}

async function cargarVideojuegos() {
  const res = await fetch(`${API_URL}/videojuegos`);
  videojuegos = await res.json();
  renderizar();
}

function renderizar() {
  const q       = searchInput.value.toLowerCase().trim();
  const estado  = filterEstado.value;
  const catId   = filterCat.value;
  const hayFiltros = q || estado || catId;

  let lista = videojuegos.filter(j => {
    const matchTitulo = !q || j.titulo.toLowerCase().includes(q);
    const matchEstado = !estado || j.estado === estado;
    const matchCat    = !catId  || String(j.categoria?.id) === catId;
    return matchTitulo && matchEstado && matchCat;
  });

  resultsCount.textContent = hayFiltros
    ? `(${lista.length} de ${videojuegos.length})`
    : `(${videojuegos.length})`;

  clearFiltersBtn.style.display = hayFiltros ? "inline-block" : "none";

  gamesList.innerHTML = "";
  emptyMsg.style.display = lista.length === 0 ? "block" : "none";

  lista.forEach(j => {
    const card = document.createElement("div");
    card.className = "game-card";

    const portada = j.imagenUrl
      ? `<img class="card-cover" src="${j.imagenUrl}" alt="${j.titulo}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        + `<div class="card-cover-placeholder" style="display:none">🎮</div>`
      : `<div class="card-cover-placeholder">🎮</div>`;

    const categoria  = j.categoria?.nombre  || "—";
    const plataforma = j.plataforma?.nombre || "—";
    const anio       = j.anio || "";

    card.innerHTML = `
      ${portada}
      <div class="card-body">
        <div class="card-title" title="${j.titulo}">${j.titulo}</div>
        <div class="card-meta">${plataforma} · ${anio}</div>
        <div class="card-meta">${categoria}</div>
        <span class="estado-badge estado-${j.estado}">${estadoLabel(j.estado)}</span>
        <div class="card-actions">
          <button class="edit-btn"   onclick="editar(${j.id})">✏ Editar</button>
          <button class="delete-btn" onclick="eliminar(${j.id})">🗑 Eliminar</button>
        </div>
      </div>
    `;

    gamesList.appendChild(card);
  });
}

function estadoLabel(estado) {
  const labels = { PENDIENTE: "Pendiente", JUGANDO: "Jugando", TERMINADO: "Terminado", FAVORITO: "Favorito" };
  return labels[estado] || estado;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const estadoRadio = document.querySelector('input[name="estado"]:checked');
  const catId       = categoriaSelect.value;
  const platId      = plataformaSelect.value;

  const data = {
    titulo:    document.getElementById("titulo").value.trim(),
    anio:      Number(document.getElementById("anio").value),
    descripcion: document.getElementById("descripcion").value.trim() || null,
    imagenUrl: document.getElementById("imagenUrl").value.trim() || null,
    estado:    estadoRadio?.value || "PENDIENTE",
    categoria: catId  ? { id: Number(catId)  } : null,
    plataforma: platId ? { id: Number(platId) } : null,
  };

  const url    = editandoId ? `${API_URL}/videojuegos/${editandoId}` : `${API_URL}/videojuegos`;
  const method = editandoId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const msg = document.getElementById("message");
  if (res.ok) {
    msg.style.color = "#4ade80";
    msg.textContent = editandoId ? "Juego actualizado." : "Juego agregado.";
    resetForm();
    await cargarVideojuegos();
  } else {
    msg.style.color = "#f87171";
    msg.textContent = "Error al guardar. Revisa los campos.";
  }

  setTimeout(() => { msg.textContent = ""; }, 3000);
});

function editar(id) {
  const j = videojuegos.find(v => v.id === id);
  if (!j) return;

  document.getElementById("form-title").textContent = "Editar videojuego";
  document.getElementById("titulo").value    = j.titulo;
  document.getElementById("anio").value      = j.anio || "";
  document.getElementById("descripcion").value = j.descripcion || "";
  document.getElementById("imagenUrl").value = j.imagenUrl || "";
  categoriaSelect.value  = j.categoria?.id  || "";
  plataformaSelect.value = j.plataforma?.id || "";

  const radio = document.querySelector(`input[name="estado"][value="${j.estado}"]`);
  if (radio) radio.checked = true;

  editandoId = id;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function eliminar(id) {
  if (!confirm("¿Eliminar este juego?")) return;
  await fetch(`${API_URL}/videojuegos/${id}`, { method: "DELETE" });
  await cargarVideojuegos();
}

function resetForm() {
  form.reset();
  document.getElementById("form-title").textContent = "Agregar videojuego";
  document.querySelector('input[name="estado"][value="PENDIENTE"]').checked = true;
  editandoId = null;
}

function limpiarFiltros() {
  searchInput.value = "";
  filterEstado.value = "";
  filterCat.value = "";
  clearSearchBtn.style.display = "none";
  renderizar();
}
