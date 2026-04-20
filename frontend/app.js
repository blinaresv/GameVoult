const API_URL = "https://game-list-api-rjqftd4irq-uc.a.run.app/api";

let videojuegos    = [];
let categorias     = [];
let plataformas    = [];
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

// ── Detalle ──
const detalleImagen      = document.getElementById("detalle-imagen");
const detallePlaceholder = document.getElementById("detalle-placeholder");

// ── Modal reseña ──
const modalResena       = document.getElementById("modal-resena");
const formResena        = document.getElementById("form-resena");
const puntuacionSlider  = document.getElementById("resena-puntuacion");
const puntuacionDisplay = document.getElementById("puntuacion-display");

// ── Preview imagen en formulario ──
const imagenUrlInput         = document.getElementById("imagenUrl");
const imagenPreview          = document.getElementById("imagen-preview");
const imagenPreviewPlaceholder = document.getElementById("imagen-preview-placeholder");

// ════════════════════════════════════════════════════════
//  INICIALIZACIÓN
// ════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([cargarCategorias(), cargarPlataformas()]);
  await cargarVideojuegos();

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
  filterEstado.addEventListener("change", renderizar);
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

  form.addEventListener("submit", guardarVideojuego);
});

// ════════════════════════════════════════════════════════
//  CARGA DE DATOS
// ════════════════════════════════════════════════════════

async function cargarCategorias() {
  const res = await fetch(`${API_URL}/categorias`);
  categorias = await res.json();

  categoriaSelect.innerHTML = '<option value="">Sin categoría</option>';
  filterCat.innerHTML = '<option value="">Todas las categorías</option>';
  categorias.forEach(c => {
    categoriaSelect.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
    filterCat.innerHTML       += `<option value="${c.id}">${c.nombre}</option>`;
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
  renderizar();
}
