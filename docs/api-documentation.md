# Documentación de la API

## GameVault — Game List Cloud

---

# 1. Introducción

La API de GameVault es un servicio REST desarrollado con Spring Boot 3.2 (Java 21) que permite gestionar videojuegos, categorías, plataformas, reseñas y wishlist mediante operaciones CRUD.

La API se conecta a PostgreSQL en Cloud SQL y es consumida por el frontend servido desde el mismo contenedor en Cloud Run.

---

# 2. URL Base

```
https://game-list-api-rjqftd4irq-uc.a.run.app
```

Todos los endpoints están bajo el prefijo `/api`.

---

# 3. Modelos de Datos

## Videojuego

```json
{
  "id": 1,
  "titulo": "God of War",
  "anio": 2018,
  "descripcion": "Aventura mitológica de Kratos y su hijo Atreus.",
  "imagenUrl": "https://ejemplo.com/gow.jpg",
  "estado": "TERMINADO",
  "categoria": {
    "id": 1,
    "nombre": "Acción"
  },
  "plataforma": {
    "id": 2,
    "nombre": "PlayStation 4",
    "fabricante": "Sony"
  }
}
```

**Estados válidos:** `PENDIENTE` | `JUGANDO` | `TERMINADO` | `FAVORITO`

---

## Categoría

```json
{
  "id": 1,
  "nombre": "Acción"
}
```

---

## Plataforma

```json
{
  "id": 1,
  "nombre": "PlayStation 5",
  "fabricante": "Sony"
}
```

---

## Reseña

```json
{
  "id": 1,
  "autor": "Brandon",
  "comentario": "Obra maestra, historia increíble.",
  "puntuacion": 9,
  "videojuego": {
    "id": 1,
    "titulo": "God of War"
  }
}
```

---

## Wishlist

```json
{
  "id": 1,
  "titulo": "Elden Ring",
  "prioridad": "ALTA",
  "notas": "Esperar oferta en Steam",
  "categoria": {
    "id": 1,
    "nombre": "RPG"
  },
  "plataforma": {
    "id": 3,
    "nombre": "PC",
    "fabricante": "N/A"
  }
}
```

**Prioridades válidas:** `ALTA` | `MEDIA` | `BAJA`

---

# 4. Endpoints de Videojuegos

## GET /api/videojuegos

Obtiene todos los videojuegos. Soporta filtros opcionales combinables.

**Query params opcionales:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `titulo` | String | Búsqueda parcial, insensible a mayúsculas. `?titulo=wit` encuentra "The Witcher 3" |
| `estado` | String | Filtra por estado. Valores: `PENDIENTE`, `JUGANDO`, `TERMINADO`, `FAVORITO` |
| `categoriaId` | Long | Filtra por ID de categoría |
| `plataformaId` | Long | Filtra por ID de plataforma |

**Ejemplos:**
```
GET /api/videojuegos
GET /api/videojuegos?titulo=witcher
GET /api/videojuegos?estado=JUGANDO&categoriaId=2
GET /api/videojuegos?plataformaId=1&estado=TERMINADO
```

**Response 200 OK:**
```json
[
  {
    "id": 1,
    "titulo": "The Witcher 3",
    "anio": 2015,
    "descripcion": "RPG de mundo abierto.",
    "imagenUrl": null,
    "estado": "JUGANDO",
    "categoria": { "id": 2, "nombre": "RPG" },
    "plataforma": { "id": 3, "nombre": "PC", "fabricante": "N/A" }
  }
]
```

---

## GET /api/videojuegos/estadisticas

Retorna el conteo de videojuegos agrupado por estado.

**Response 200 OK:**
```json
{
  "PENDIENTE": 5,
  "JUGANDO": 2,
  "TERMINADO": 8,
  "FAVORITO": 3,
  "TOTAL": 18
}
```

---

## GET /api/videojuegos/{id}

Obtiene un videojuego por su ID.

**Response 200 OK:** objeto Videojuego completo.

**Error 404:**
```json
{
  "timestamp": "2025-04-22T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Videojuego con id 99 no encontrado"
}
```

---

## GET /api/videojuegos/{id}/categoria

Retorna la categoría asignada al videojuego.

**Response 200 OK:**
```json
{
  "id": 2,
  "nombre": "RPG"
}
```

**Error 404** si el videojuego no existe o no tiene categoría asignada.

---

## POST /api/videojuegos

Crea un nuevo videojuego.

**Request Body:**
```json
{
  "titulo": "Hollow Knight",
  "anio": 2017,
  "descripcion": "Metroidvania de insectos.",
  "imagenUrl": "https://ejemplo.com/hk.jpg",
  "estado": "PENDIENTE",
  "categoria": { "id": 1 },
  "plataforma": { "id": 3 }
}
```

**Validaciones:**
- `titulo`: obligatorio, no vacío
- `anio`: número entero válido
- `estado`: uno de los 4 valores válidos
- `categoria` y `plataforma`: opcionales; si se envían, el `id` debe existir

**Response 201 Created:** objeto Videojuego creado con su `id`.

**Error 400:**
```json
{
  "timestamp": "...",
  "status": 400,
  "error": "Bad Request",
  "message": "titulo: no debe estar vacío"
}
```

---

## PUT /api/videojuegos/{id}

Actualiza todos los campos de un videojuego existente.

**Request Body:** mismo formato que POST.

**Response 200 OK:** objeto Videojuego actualizado.

**Error 404** si el ID no existe.

---

## DELETE /api/videojuegos/{id}

Elimina un videojuego y sus reseñas asociadas (cascade).

**Response 204 No Content** (sin body).

**Error 404** si el ID no existe.

---

# 5. Endpoints de Categorías

## GET /api/categorias

Retorna todas las categorías.

**Response 200 OK:**
```json
[
  { "id": 1, "nombre": "Acción" },
  { "id": 2, "nombre": "RPG" }
]
```

---

## GET /api/categorias/{id}

Retorna una categoría por ID.

---

## POST /api/categorias

Crea una nueva categoría. El nombre debe ser único (insensible a mayúsculas).

**Request Body:**
```json
{
  "nombre": "Aventura"
}
```

**Response 201 Created:**
```json
{ "id": 3, "nombre": "Aventura" }
```

**Error 409 Conflict** si ya existe una categoría con ese nombre.

---

## PUT /api/categorias/{id}

Actualiza el nombre de una categoría.

**Request Body:**
```json
{ "nombre": "Aventura y Acción" }
```

**Response 200 OK:** categoría actualizada.

**Error 409 Conflict** si el nuevo nombre ya lo usa otra categoría.

---

## DELETE /api/categorias/{id}

Elimina una categoría.

**Response 204 No Content**.

**Error 404** si no existe.

---

# 6. Endpoints de Plataformas

## GET /api/plataformas

Retorna todas las plataformas.

**Response 200 OK:**
```json
[
  { "id": 1, "nombre": "PlayStation 5", "fabricante": "Sony" },
  { "id": 2, "nombre": "Xbox Series X", "fabricante": "Microsoft" },
  { "id": 3, "nombre": "PC", "fabricante": "N/A" }
]
```

---

## GET /api/plataformas/{id}

Retorna una plataforma por ID.

---

## POST /api/plataformas

Crea una nueva plataforma. El nombre debe ser único.

**Request Body:**
```json
{
  "nombre": "Nintendo Switch",
  "fabricante": "Nintendo"
}
```

**Response 201 Created:** objeto Plataforma con `id`.

**Error 409 Conflict** si el nombre ya existe.

---

## PUT /api/plataformas/{id}

Actualiza nombre y fabricante de una plataforma.

**Request Body:**
```json
{
  "nombre": "Nintendo Switch OLED",
  "fabricante": "Nintendo"
}
```

**Response 200 OK:** plataforma actualizada.

---

## DELETE /api/plataformas/{id}

Elimina una plataforma.

**Response 204 No Content**.

**Error 404** si no existe.

---

# 7. Endpoints de Reseñas

## GET /api/resenas/videojuego/{videojuegoId}

Retorna todas las reseñas de un videojuego específico.

**Response 200 OK:**
```json
[
  {
    "id": 1,
    "autor": "Brandon",
    "comentario": "Historia increíble, lo recomiendo.",
    "puntuacion": 9,
    "videojuego": { "id": 1, "titulo": "God of War" }
  }
]
```

**Error 404** si el videojuego no existe.

---

## POST /api/resenas

Crea una reseña vinculada a un videojuego existente.

**Request Body:**
```json
{
  "videojuegoId": 1,
  "autor": "Brandon",
  "comentario": "Juego excelente, 100% recomendado.",
  "puntuacion": 9
}
```

**Validaciones:**
- `videojuegoId`: obligatorio, debe existir
- `autor`: obligatorio, no vacío
- `comentario`: obligatorio, no vacío
- `puntuacion`: entero entre 1 y 10

**Response 201 Created:** objeto Reseña creada con su `id`.

**Error 400** si la puntuación está fuera de rango o falta algún campo obligatorio.

**Error 404** si el videojuego no existe.

---

## DELETE /api/resenas/{id}

Elimina una reseña por ID.

**Response 204 No Content**.

**Error 404** si la reseña no existe.

---

# 8. Endpoints de Wishlist

## GET /api/wishlist

Retorna los items de la wishlist. Soporta filtros opcionales.

**Query params opcionales:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `titulo` | String | Búsqueda parcial por título |
| `prioridad` | String | Filtra por prioridad: `ALTA`, `MEDIA`, `BAJA` |

**Ejemplos:**
```
GET /api/wishlist
GET /api/wishlist?prioridad=ALTA
GET /api/wishlist?titulo=elden
```

**Response 200 OK:**
```json
[
  {
    "id": 1,
    "titulo": "Elden Ring",
    "prioridad": "ALTA",
    "notas": "Esperar oferta",
    "categoria": { "id": 2, "nombre": "RPG" },
    "plataforma": { "id": 3, "nombre": "PC", "fabricante": "N/A" }
  }
]
```

---

## GET /api/wishlist/{id}

Retorna un item de wishlist por ID.

**Error 404** si no existe.

---

## POST /api/wishlist

Agrega un nuevo item a la wishlist.

**Request Body:**
```json
{
  "titulo": "Elden Ring",
  "prioridad": "ALTA",
  "notas": "Esperar oferta en Steam",
  "categoria": { "id": 2 },
  "plataforma": { "id": 3 }
}
```

**Validaciones:**
- `titulo`: obligatorio, no vacío
- `prioridad`: obligatorio, uno de `ALTA`, `MEDIA`, `BAJA`
- `categoria` y `plataforma`: opcionales

**Response 201 Created:** objeto Wishlist con `id`.

---

## PUT /api/wishlist/{id}

Actualiza un item de wishlist existente.

**Request Body:** mismo formato que POST.

**Response 200 OK:** objeto actualizado.

**Error 404** si no existe.

---

## DELETE /api/wishlist/{id}

Elimina un item de la wishlist.

**Response 204 No Content**.

**Error 404** si no existe.

---

# 9. Manejo de Errores

Todos los errores siguen esta estructura JSON:

```json
{
  "timestamp": "2025-04-22T10:30:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Videojuego con id 99 no encontrado",
  "path": "/api/videojuegos/99"
}
```

| Código | Causa |
|--------|-------|
| 400 | Validación fallida (campo vacío, rango inválido, etc.) |
| 404 | Recurso no encontrado |
| 409 | Conflicto — nombre duplicado en categoría o plataforma |
| 500 | Error interno del servidor |

---

# 10. Swagger UI

Documentación interactiva disponible en producción:

```
https://game-list-api-rjqftd4irq-uc.a.run.app/swagger-ui/index.html
```

Permite ejecutar peticiones directamente desde el navegador.

---

# 11. Pruebas Realizadas

- Swagger UI (producción)
- Postman (colección manual por endpoint)
- Frontend integrado en Cloud Run
- Capturas en [docs/screenshot/](screenshot/)
