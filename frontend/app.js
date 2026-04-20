const API_URL = "https://game-list-api-rjqftd4irq-uc.a.run.app"; // 🔥 SIN / al final

let videojuegos = [];
let categorias = [];
let editandoId = null;

const form = document.getElementById("game-form");
const gamesList = document.getElementById("games-list");
const categoriaSelect = document.getElementById("categoriaId");
const estadoSelect = document.getElementById("estado");

document.addEventListener("DOMContentLoaded", async () => {
  await cargarCategorias();
  await cargarVideojuegos();
});

async function cargarCategorias() {
  const res = await fetch(`${API_URL}/categorias`);
  categorias = await res.json();

  categoriaSelect.innerHTML = "";
  categorias.forEach(c => {
    categoriaSelect.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
  });
}

async function cargarVideojuegos() {
  const res = await fetch(`${API_URL}/videojuegos`);
  videojuegos = await res.json();
  renderizar();
}

function renderizar() {
  gamesList.innerHTML = "";

  videojuegos.forEach(j => {
    gamesList.innerHTML += `
      <div class="game-card">
        <h3>${j.titulo}</h3>
        <p>${j.plataforma} - ${j.anio}</p>
        <p>${j.categoria?.nombre || ''}</p>

        <span class="estado ${j.estado}">${j.estado}</span>

        <div class="actions">
          <button class="view-btn" onclick="ver(${j.id})">Ver</button>
          <button class="edit-btn" onclick="editar(${j.id})">Editar</button>
          <button class="delete-btn" onclick="eliminar(${j.id})">Eliminar</button>
        </div>
      </div>
    `;
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    titulo: document.getElementById("titulo").value,
    plataforma: document.getElementById("plataforma").value,
    anio: Number(document.getElementById("anio").value),
    estado: estadoSelect.value,
    categoria: {
      id: Number(categoriaSelect.value)
    }
  };

  if (editandoId) {
    await fetch(`${API_URL}/videojuegos/${editandoId}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });
  } else {
    await fetch(`${API_URL}/videojuegos`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });
  }

  form.reset();
  editandoId = null;
  cargarVideojuegos();
});

function editar(id) {
  const j = videojuegos.find(v => v.id === id);

  document.getElementById("titulo").value = j.titulo;
  document.getElementById("plataforma").value = j.plataforma;
  document.getElementById("anio").value = j.anio;
  categoriaSelect.value = j.categoria?.id;
  estadoSelect.value = j.estado;

  editandoId = id;
}

async function eliminar(id) {
  await fetch(`${API_URL}/videojuegos/${id}`, {
    method: "DELETE"
  });
  cargarVideojuegos();
}

function ver(id) {
  const j = videojuegos.find(v => v.id === id);
  document.getElementById("game-detail").innerHTML = `
    <b>${j.titulo}</b><br>
    ${j.plataforma}<br>
    ${j.anio}<br>
    ${j.estado}<br>
    ${j.categoria?.nombre || ''}
  `;
}