// En Docker/Cloud Run el frontend y la API comparten origen → URL relativa.
// En local con Live Server (puerto ≠ 8080) → URL absoluta al backend de desarrollo.
const API_URL = (window.location.hostname === 'localhost' && window.location.port !== '8080')
  ? 'http://localhost:8080/api'
  : '/api';

let videojuegos    = [];
let categorias     = [];
let plataformas    = [];
let wishlistItems  = [];
let editandoId     = null;
let detalleJuegoId = null;

// ── Biblioteca ──
const form             = document.getElementById("game-form");
const formSection      = document.getElementById("form-section");
const gamesList        = document.getElementById("games-list");
const emptyMsg         = document.getElementById("empty-msg");
const categoriaSelect  = document.getElementById("categoriaId");
const plataformaSelect = document.getElementById("plataformaId");
const searchInput      = document.getElementById("search-input");
const filterEstado     = document.getElementById("filter-estado");
const filterCat        = document.getElementById("filter-category");
const clearSearchBtn   = document.getElementById("clear-search");
const clearFiltersBtn  = document.getElementById("clear-filters-btn");
const resultsCount     = document.getElementById("results-count");

// ── Vistas ──
const vistaBiblioteca = document.getElementById("vista-biblioteca");
const vistaDetalle    = document.getElementById("vista-detalle");
const vistaWishlist   = document.getElementById("vista-wishlist");

// ── Detalle ──
const detalleImagen      = document.getElementById("detalle-imagen");
const detallePlaceholder = document.getElementById("detalle-placeholder");

// ── Modal reseña ──
const modalResena       = document.getElementById("modal-resena");
const formResena        = document.getElementById("form-resena");
const puntuacionSlider  = document.getElementById("resena-puntuacion");
const puntuacionDisplay = document.getElementById("puntuacion-display");

// ── Preview imagen en formulario ──
const imagenUrlInput           = document.getElementById("imagenUrl");
const imagenPreview            = document.getElementById("imagen-preview");
const imagenPreviewPlaceholder = document.getElementById("imagen-preview-placeholder");

// ── Modal wishlist ──
const modalWishlist  = document.getElementById("modal-wishlist");
const formWishlist   = document.getElementById("form-wishlist");

// ════════════════════════════════════════════════════════
//  INICIALIZACIÓN
// ════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([cargarCategorias(), cargarPlataformas()]);
  await cargarVideojuegos();
  await cargarEstadisticas();

  // Navegación por tabs
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => cambiarVistaPrincipal(tab.dataset.vista));
  });

  // Pills de estadísticas — filtran la biblioteca al hacer clic
  document.querySelectorAll(".stat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".stat-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      filterEstado.value = pill.dataset.estado;
      renderizar();
    });
  });

  // Formulario toggle
  document.getElementById("btn-abrir-formulario").addEventListener("click", abrirFormulario);
  document.getElementById("reload-btn").addEventListener("click", cargarVideojuegos);
  document.getElementById("cancel-btn").addEventListener("click", () => {
    if (editandoId && !confirm("¿Descartar los cambios de edición?")) return;
    resetForm();
  });

  // Preview de imagen en tiempo real
  imagenUrlInput.addEventListener("input", actualizarPreviewImagen);

  searchInput.addEventListener("input", () => {
    clearSearchBtn.style.display = searchInput.value ? "block" : "none";
    renderizar();
  });
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearSearchBtn.style.display = "none";
    renderizar();
  });
  filterEstado.addEventListener("change", () => {
    sincronizarPillActiva(filterEstado.value);
    renderizar();
  });
  filterCat.addEventListener("change", renderizar);
  clearFiltersBtn.addEventListener("click", limpiarFiltros);

  // Detalle
  document.getElementById("btn-volver").addEventListener("click", mostrarBiblioteca);
  document.getElementById("detalle-btn-editar").addEventListener("click", () => {
    mostrarBiblioteca();
    editar(detalleJuegoId);
  });
  document.getElementById("detalle-btn-eliminar").addEventListener("click", async () => {
    if (!confirm("¿Eliminar este juego?")) return;
    await fetch(`${API_URL}/videojuegos/${detalleJuegoId}`, { method: "DELETE" });
    mostrarBiblioteca();
    await cargarVideojuegos();
  });

  // Modal reseña
  document.getElementById("btn-abrir-modal-resena").addEventListener("click", () => {
    formResena.reset();
    puntuacionDisplay.textContent = "5";
    modalResena.style.display = "flex";
  });
  document.getElementById("btn-cerrar-modal").addEventListener("click", () => {
    modalResena.style.display = "none";
  });
  modalResena.addEventListener("click", (e) => {
    if (e.target === modalResena) modalResena.style.display = "none";
  });
  puntuacionSlider.addEventListener("input", () => {
    puntuacionDisplay.textContent = puntuacionSlider.value;
  });
  formResena.addEventListener("submit", guardarResena);

  // Modal wishlist
  document.getElementById("btn-abrir-modal-wishlist").addEventListener("click", () => {
    formWishlist.reset();
    document.getElementById("wl-error-titulo").textContent = "";
    document.querySelector('input[name="wl-prioridad"][value="MEDIA"]').checked = true;
    modalWishlist.style.display = "flex";
  });
  document.getElementById("btn-cerrar-modal-wl").addEventListener("click", () => {
    modalWishlist.style.display = "none";
  });
  modalWishlist.addEventListener("click", (e) => {
    if (e.target === modalWishlist) modalWishlist.style.display = "none";
  });
  formWishlist.addEventListener("submit", guardarWishlistItem);

  document.getElementById("wl-filter-prioridad").addEventListener("change", renderizarWishlist);

  form.addEventListener("submit", guardarVideojuego);
});

// ════════════════════════════════════════════════════════
//  NAVEGACIÓN
// ════════════════════════════════════════════════════════

function cambiarVistaPrincipal(vista) {
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
  document.querySelector(`[data-vista="${vista}"]`).classList.add("active");

  vistaBiblioteca.style.display = vista === "biblioteca" ? "block" : "none";
  vistaDetalle.style.display    = "none";
  vistaWishlist.style.display   = vista === "wishlist"   ? "block" : "none";

  if (vista === "wishlist") cargarWishlist();
}

// ════════════════════════════════════════════════════════
//  CARGA DE DATOS
// ════════════════════════════════════════════════════════

async function cargarCategorias() {
  const res = await fetch(`${API_URL}/categorias`);
  categorias = await res.json();

  const wlCatSelect = document.getElementById("wl-categoriaId");
  categoriaSelect.innerHTML = '<option value="">Sin categoría</option>';
  filterCat.innerHTML       = '<option value="">Todas las categorías</option>';
  wlCatSelect.innerHTML     = '<option value="">Sin categoría</option>';
  categorias.forEach(c => {
    const opt = `<option value="${c.id}">${c.nombre}</option>`;
    categoriaSelect.innerHTML += opt;
    filterCat.innerHTML       += opt;
    wlCatSelect.innerHTML     += opt;
  });
}

async function cargarPlataformas() {
  const res = await fetch(`${API_URL}/plataformas`);
  plataformas = await res.json();

  const wlPlatSelect = document.getElementById("wl-plataformaId");
  plataformaSelect.innerHTML = '<option value="">Sin plataforma</option>';
  wlPlatSelect.innerHTML     = '<option value="">Sin plataforma</option>';
  plataformas.forEach(p => {
    const opt = `<option value="${p.id}">${p.nombre}</option>`;
    plataformaSelect.innerHTML += opt;
    wlPlatSelect.innerHTML     += opt;
  });
}

async function cargarVideojuegos() {
  const res = await fetch(`${API_URL}/videojuegos`);
  videojuegos = await res.json();
  renderizar();
  await cargarEstadisticas();
}

async function cargarEstadisticas() {
  const res = await fetch(`${API_URL}/videojuegos/estadisticas`);
  if (!res.ok) return;
  const stats = await res.json();

  const claves = ["TOTAL", "PENDIENTE", "JUGANDO", "TERMINADO", "FAVORITO"];
  claves.forEach(k => {
    const el = document.getElementById(`num-${k}`);
    if (el) el.textContent = stats[k] ?? 0;
  });
}

// ════════════════════════════════════════════════════════
//  RENDERIZADO BIBLIOTECA
// ════════════════════════════════════════════════════════

function renderizar() {
  const q      = searchInput.value.toLowerCase().trim();
  const estado = filterEstado.value;
  const catId  = filterCat.value;
  const hayFiltros = q || estado || catId;

  const lista = videojuegos.filter(j => {
    const matchTitulo = !q     || j.titulo.toLowerCase().includes(q);
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
      ? `<img class="card-cover" src="${j.imagenUrl}" alt="${j.titulo}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
         <div class="card-cover-placeholder" style="display:none">🎮</div>`
      : `<div class="card-cover-placeholder">🎮</div>`;

    card.innerHTML = `
      ${portada}
      <div class="card-body">
        <div class="card-title" title="${j.titulo}">${j.titulo}</div>
        <div class="card-meta">${j.plataforma?.nombre || '—'} · ${j.anio || ''}</div>
        <div class="card-meta">${j.categoria?.nombre || '—'}</div>
        <span class="estado-badge estado-${j.estado}">${estadoLabel(j.estado)}</span>
        <div class="card-actions">
          <button class="edit-btn"   onclick="event.stopPropagation();editar(${j.id})">✏ Editar</button>
          <button class="delete-btn" onclick="event.stopPropagation();eliminar(${j.id})">🗑 Eliminar</button>
        </div>
      </div>`;

    card.addEventListener("click", () => verDetalle(j.id));
    gamesList.appendChild(card);
  });
}

function estadoLabel(estado) {
  const labels = { PENDIENTE: "Pendiente", JUGANDO: "Jugando", TERMINADO: "Terminado", FAVORITO: "Favorito" };
  return labels[estado] || estado;
}

// ════════════════════════════════════════════════════════
//  VISTA DETALLE
// ════════════════════════════════════════════════════════

async function verDetalle(id) {
  detalleJuegoId = id;
  const j = videojuegos.find(v => v.id === id);
  if (!j) return;

  // Imagen o placeholder
  if (j.imagenUrl) {
    detalleImagen.src = j.imagenUrl;
    detalleImagen.alt = j.titulo;
    detalleImagen.style.display = "block";
    detallePlaceholder.style.display = "none";
    detalleImagen.onerror = () => {
      detalleImagen.style.display = "none";
      detallePlaceholder.style.display = "flex";
    };
  } else {
    detalleImagen.style.display = "none";
    detallePlaceholder.style.display = "flex";
  }

  document.getElementById("detalle-titulo").textContent    = j.titulo;
  document.getElementById("detalle-anio").textContent      = j.anio || "—";
  document.getElementById("detalle-categoria").textContent = j.categoria?.nombre  || "—";
  document.getElementById("detalle-plataforma").textContent= j.plataforma?.nombre || "—";
  document.getElementById("detalle-descripcion").textContent = j.descripcion || "";

  const badge = document.getElementById("detalle-estado");
  badge.textContent  = estadoLabel(j.estado);
  badge.className    = `estado-badge estado-${j.estado}`;

  vistaBiblioteca.style.display = "none";
  vistaDetalle.style.display    = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });

  await cargarResenas(id);
}

function mostrarBiblioteca() {
  vistaDetalle.style.display    = "none";
  vistaBiblioteca.style.display = "block";
  detalleJuegoId = null;
}

// ════════════════════════════════════════════════════════
//  RESEÑAS
// ════════════════════════════════════════════════════════

async function cargarResenas(videojuegoId) {
  const lista    = document.getElementById("resenas-lista");
  const emptyRes = document.getElementById("resenas-empty");
  lista.innerHTML = '<p style="color:#64748b;font-size:13px">Cargando reseñas...</p>';

  const res    = await fetch(`${API_URL}/resenas/videojuego/${videojuegoId}`);
  const resenas = await res.json();

  lista.innerHTML = "";

  if (resenas.length === 0) {
    emptyRes.style.display = "block";
    document.getElementById("detalle-promedio").textContent = "—";
    return;
  }

  emptyRes.style.display = "none";

  const promedio = (resenas.reduce((s, r) => s + r.puntuacion, 0) / resenas.length).toFixed(1);
  document.getElementById("detalle-promedio").textContent = `${promedio} ★`;

  resenas.forEach(r => {
    const div = document.createElement("div");
    div.className = "resena-card";
    div.innerHTML = `
      <div class="resena-score">${r.puntuacion}</div>
      <div class="resena-body">
        <div class="resena-autor">${r.autor || "Anónimo"}</div>
        <div class="resena-comentario">${r.comentario || ""}</div>
      </div>
      <button class="resena-delete" title="Eliminar reseña" onclick="eliminarResena(${r.id})">🗑</button>`;
    lista.appendChild(div);
  });
}

async function guardarResena(e) {
  e.preventDefault();
  const data = {
    autor:      document.getElementById("resena-autor").value.trim(),
    puntuacion: Number(puntuacionSlider.value),
    comentario: document.getElementById("resena-comentario").value.trim() || null,
    videojuego: { id: detalleJuegoId },
  };

  const res = await fetch(`${API_URL}/resenas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    modalResena.style.display = "none";
    await cargarResenas(detalleJuegoId);
  }
}

async function eliminarResena(id) {
  if (!confirm("¿Eliminar esta reseña?")) return;
  await fetch(`${API_URL}/resenas/${id}`, { method: "DELETE" });
  await cargarResenas(detalleJuegoId);
}

// ════════════════════════════════════════════════════════
//  CRUD VIDEOJUEGO (formulario)
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
//  FORMULARIO: ABRIR / CERRAR / VALIDAR
// ════════════════════════════════════════════════════════

function abrirFormulario() {
  formSection.style.display = "block";
  document.getElementById("btn-abrir-formulario").style.display = "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cerrarFormulario() {
  formSection.style.display = "none";
  document.getElementById("btn-abrir-formulario").style.display = "inline-block";
}

function actualizarPreviewImagen() {
  const url = imagenUrlInput.value.trim();
  if (url) {
    imagenPreview.src = url;
    imagenPreview.style.display = "block";
    imagenPreviewPlaceholder.style.display = "none";
    imagenPreview.onerror = () => {
      imagenPreview.style.display = "none";
      imagenPreviewPlaceholder.style.display = "flex";
    };
  } else {
    imagenPreview.style.display = "none";
    imagenPreviewPlaceholder.style.display = "flex";
  }
}

function validarFormulario() {
  let valido = true;

  const titulo = document.getElementById("titulo").value.trim();
  const anio   = document.getElementById("anio").value;
  const errorTitulo = document.getElementById("error-titulo");
  const errorAnio   = document.getElementById("error-anio");
  const grupoTitulo = document.getElementById("titulo").closest(".field-group");
  const grupoAnio   = document.getElementById("anio").closest(".field-group");

  if (!titulo) {
    errorTitulo.textContent = "El título es obligatorio.";
    grupoTitulo.classList.add("has-error");
    valido = false;
  } else {
    errorTitulo.textContent = "";
    grupoTitulo.classList.remove("has-error");
  }

  if (!anio) {
    errorAnio.textContent = "El año es obligatorio.";
    grupoAnio.classList.add("has-error");
    valido = false;
  } else if (Number(anio) < 1970 || Number(anio) > 2100) {
    errorAnio.textContent = "El año debe estar entre 1970 y 2100.";
    grupoAnio.classList.add("has-error");
    valido = false;
  } else {
    errorAnio.textContent = "";
    grupoAnio.classList.remove("has-error");
  }

  return valido;
}

async function guardarVideojuego(e) {
  e.preventDefault();
  if (!validarFormulario()) return;

  const estadoRadio = document.querySelector('input[name="estado"]:checked');
  const catId       = categoriaSelect.value;
  const platId      = plataformaSelect.value;

  const data = {
    titulo:      document.getElementById("titulo").value.trim(),
    anio:        Number(document.getElementById("anio").value),
    descripcion: document.getElementById("descripcion").value.trim() || null,
    imagenUrl:   imagenUrlInput.value.trim() || null,
    estado:      estadoRadio?.value || "PENDIENTE",
    categoria:   catId  ? { id: Number(catId)  } : null,
    plataforma:  platId ? { id: Number(platId) } : null,
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
    setTimeout(() => { msg.textContent = ""; }, 3000);
  } else {
    msg.style.color = "#f87171";
    msg.textContent = "Error al guardar. Verifica los campos e inténtalo de nuevo.";
  }
}

function editar(id) {
  const j = videojuegos.find(v => v.id === id);
  if (!j) return;

  document.getElementById("form-title").textContent    = "Editar videojuego";
  document.getElementById("titulo").value              = j.titulo;
  document.getElementById("anio").value                = j.anio   || "";
  document.getElementById("descripcion").value         = j.descripcion || "";
  imagenUrlInput.value                                 = j.imagenUrl   || "";
  categoriaSelect.value  = j.categoria?.id  || "";
  plataformaSelect.value = j.plataforma?.id || "";

  const radio = document.querySelector(`input[name="estado"][value="${j.estado}"]`);
  if (radio) radio.checked = true;

  // Modo edición visual
  formSection.classList.add("editing");
  document.getElementById("form-mode-badge").style.display = "inline-block";
  document.getElementById("btn-submit-form").textContent = "Guardar cambios";

  actualizarPreviewImagen();

  editandoId = id;
  abrirFormulario();
}

async function eliminar(id) {
  if (!confirm("¿Eliminar este juego?")) return;
  await fetch(`${API_URL}/videojuegos/${id}`, { method: "DELETE" });
  await cargarVideojuegos();
}

function resetForm() {
  form.reset();
  document.getElementById("form-title").textContent          = "Agregar videojuego";
  document.getElementById("btn-submit-form").textContent     = "Guardar";
  document.getElementById("form-mode-badge").style.display   = "none";
  document.getElementById("error-titulo").textContent        = "";
  document.getElementById("error-anio").textContent          = "";
  document.getElementById("titulo").closest(".field-group").classList.remove("has-error");
  document.getElementById("anio").closest(".field-group").classList.remove("has-error");
  document.querySelector('input[name="estado"][value="PENDIENTE"]').checked = true;
  formSection.classList.remove("editing");
  imagenPreview.style.display = "none";
  imagenPreviewPlaceholder.style.display = "flex";
  editandoId = null;
  cerrarFormulario();
}

function limpiarFiltros() {
  searchInput.value  = "";
  filterEstado.value = "";
  filterCat.value    = "";
  clearSearchBtn.style.display = "none";
  sincronizarPillActiva("");
  renderizar();
}

function sincronizarPillActiva(estado) {
  document.querySelectorAll(".stat-pill").forEach(p => {
    p.classList.toggle("active", p.dataset.estado === estado);
  });
}

// ════════════════════════════════════════════════════════
//  WISHLIST
// ════════════════════════════════════════════════════════

async function cargarWishlist() {
  const res = await fetch(`${API_URL}/wishlist`);
  wishlistItems = await res.json();
  renderizarWishlist();
}

function renderizarWishlist() {
  const filtroPrioridad = document.getElementById("wl-filter-prioridad").value;
  const lista = filtroPrioridad
    ? wishlistItems.filter(w => w.prioridad === filtroPrioridad)
    : wishlistItems;

  const grid  = document.getElementById("wishlist-list");
  const empty = document.getElementById("wishlist-empty");
  const count = document.getElementById("wishlist-count");

  count.textContent = filtroPrioridad
    ? `(${lista.length} de ${wishlistItems.length})`
    : `(${wishlistItems.length})`;

  grid.innerHTML = "";
  empty.style.display = lista.length === 0 ? "block" : "none";

  lista.forEach(w => {
    const div = document.createElement("div");
    div.className = `wl-card prioridad-${w.prioridad}`;

    const plat = w.plataforma?.nombre || w.plataformaNombre || "—";
    const cat  = w.categoria?.nombre  || w.categoriaNombre  || "—";
    const prioLabel = { ALTA: "Alta", MEDIA: "Media", BAJA: "Baja" };

    div.innerHTML = `
      <div class="wl-card-header">
        <div class="wl-titulo">${w.titulo}</div>
        <button class="wl-delete" title="Eliminar" onclick="eliminarWishlistItem(${w.id})">🗑</button>
      </div>
      <span class="wl-badge prioridad-badge-${w.prioridad}">${prioLabel[w.prioridad] || w.prioridad}</span>
      <div class="wl-meta">${plat} · ${cat}</div>
      ${w.notas ? `<div class="wl-notas">"${w.notas}"</div>` : ""}
    `;
    grid.appendChild(div);
  });
}

async function guardarWishlistItem(e) {
  e.preventDefault();

  const titulo = document.getElementById("wl-titulo").value.trim();
  const errorEl = document.getElementById("wl-error-titulo");

  if (!titulo) {
    errorEl.textContent = "El título es obligatorio.";
    return;
  }
  errorEl.textContent = "";

  const prioridad = document.querySelector('input[name="wl-prioridad"]:checked')?.value || "MEDIA";
  const catId     = document.getElementById("wl-categoriaId").value;
  const platId    = document.getElementById("wl-plataformaId").value;

  const data = {
    titulo,
    prioridad,
    notas:     document.getElementById("wl-notas").value.trim() || null,
    categoria: catId  ? { id: Number(catId)  } : null,
    plataforma: platId ? { id: Number(platId) } : null,
  };

  const res = await fetch(`${API_URL}/wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    modalWishlist.style.display = "none";
    await cargarWishlist();
  }
}

async function eliminarWishlistItem(id) {
  if (!confirm("¿Quitar este juego de la wishlist?")) return;
  await fetch(`${API_URL}/wishlist/${id}`, { method: "DELETE" });
  await cargarWishlist();
}
