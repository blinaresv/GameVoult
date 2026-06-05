# Documentación de la API

## GameVault — Game List Cloud

---

# 1. Introducción

La API de GameVault es un servicio REST desarrollado con Spring Boot 3.2 (Java 21) que permite gestionar videojuegos, categorías, plataformas, reseñas y wishlist mediante operaciones CRUD.

La API se conecta a PostgreSQL en Cloud SQL y es consumida por el frontend servido desde el mismo contenedor en Cloud Run. A partir del Proyecto 3 incluye autenticación de usuarios, protección de escritura por API Key, exportación de datos a CSV y métricas para monitoreo con Prometheus y Grafana.

---

# 2. URL Base

```
https://game-list-api-rjqftd4irq-uc.a.run.app
```

Todos los endpoints de negocio están bajo el prefijo `/api`. El endpoint de métricas (`/metrics`) queda fuera de ese prefijo.

---

# 3. Autenticación y Seguridad

La API protege los datos por usuario y las operaciones de escritura sobre recursos compartidos. Existen dos mecanismos de credenciales:

- **Token de sesión (Bearer):** se obtiene en `/api/auth/login` o `/api/auth/register` y se envía en la cabecera `Authorization: Bearer <token>`.
- **API Key:** clave técnica de respaldo que se envía en la cabecera `X-API-Key`. Solo habilita escrituras sobre recursos compartidos; no da acceso a los datos por usuario.

## Reglas de acceso

| Recurso | Lectura | Escritura (POST/PUT/PATCH/DELETE) |
|---------|---------|-----------------------------------|
| `/api/auth/**` | Pública | Pública |
| `/api/videojuegos`, `/api/wishlist`, `/api/resenas` | Token de usuario | Token de usuario |
| `/api/categorias`, `/api/plataformas` | Pública | Token de usuario o `X-API-Key` |

Los recursos por usuario (`videojuegos`, `wishlist`, `resenas`) solo devuelven y modifican los datos del usuario autenticado. Una petición sin credencial válida sobre un recurso protegido retorna **401**.

## POST /api/auth/register

Registra un nuevo usuario con rol `USER`.

**Request Body:**
```json
{
  "username": "brandon",
  "password": "secreto123",
  "displayName": "Brandon"
}
```

**Validaciones:**
- `username`: obligatorio, 3 a 30 caracteres (`A-Z a-z 0-9 _ . -`)
- `password`: obligatorio, entre 6 y 80 caracteres
- `displayName`: opcional; si se omite se usa el `username`

**Response 201 Created:**
```json
{
  "token": "YWRtaW58QURNSU4...",
  "username": "brandon",
  "displayName": "Brandon",
  "role": "USER",
  "expiresAt": "2026-06-05T13:01:37Z"
}
```

**Error 409 Conflict** si el `username` ya existe.
**Error 400** si falla alguna validación.

## POST /api/auth/login

Autentica un usuario y devuelve un token de sesión.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response 200 OK:** mismo formato que `register` (`token`, `username`, `displayName`, `role`, `expiresAt`).

**Error 401** si el usuario o la contraseña son inválidos.
**Error 400** si falta el usuario o la contraseña.

## Uso del token

```
Authorization: Bearer <token>
```

El token expira según `expiresAt`. Cuando expira o es inválido, los endpoints protegidos responden 401 y el frontend redirige al login.

---

# 4. Modelos de Datos

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

## Usuario

```json
{
  "username": "brandon",
  "displayName": "Brandon",
  "role": "USER"
}
```

**Roles válidos:** `ADMIN` | `USER`. La contraseña se almacena hasheada y nunca se devuelve en las respuestas.

---

# 5. Endpoints de Videojuegos

> Recurso por usuario: todas las operaciones requieren token de usuario y operan solo sobre los videojuegos del usuario autenticado.

## GET /api/videojuegos

Obtiene los videojuegos del usuario. Soporta filtros opcionales combinables.

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

Retorna el conteo de videojuegos del usuario agrupado por estado.

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

## GET /api/videojuegos/export/csv

Exporta los videojuegos del usuario autenticado en formato CSV. Acepta los mismos filtros que `GET /api/videojuegos`, por lo que se puede exportar una búsqueda concreta.

**Query params opcionales:** `titulo`, `estado`, `categoriaId`, `plataformaId` (idénticos al listado).

**Response 200 OK:**
- `Content-Type: text/csv; charset=UTF-8`
- `Content-Disposition: attachment; filename=videojuegos.csv`

```
id,titulo,anio,estado,categoria,plataforma,descripcion
1,The Witcher 3,2015,JUGANDO,RPG,PC,RPG de mundo abierto.
2,God of War,2018,TERMINADO,Acción,PlayStation 4,Aventura mitológica.
```

Requiere token de usuario. El frontend incluye un botón **Exportar CSV** que descarga este archivo.

---

## GET /api/videojuegos/{id}

Obtiene un videojuego del usuario por su ID.

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

Crea un nuevo videojuego para el usuario autenticado.

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

# 6. Endpoints de Categorías

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

Crea una nueva categoría. El nombre debe ser único (insensible a mayúsculas). Requiere token de usuario o `X-API-Key`.

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

# 7. Endpoints de Plataformas

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

Crea una nueva plataforma. El nombre debe ser único. Requiere token de usuario o `X-API-Key`.

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

# 8. Endpoints de Reseñas

> Recurso por usuario: las reseñas se asocian a videojuegos del usuario autenticado.

## GET /api/resenas/videojuego/{videojuegoId}

Retorna todas las reseñas de un videojuego específico del usuario.

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

Crea una reseña vinculada a un videojuego existente del usuario.

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

# 9. Endpoints de Wishlist

> Recurso por usuario: todas las operaciones requieren token de usuario y operan solo sobre la wishlist del usuario autenticado.

## GET /api/wishlist

Retorna los items de la wishlist del usuario. Soporta filtros opcionales.

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

# 10. Monitoreo y Métricas

La API expone métricas en formato Prometheus para observar throughput, latencia y estado general del sistema.

## GET /metrics

Endpoint público (fuera del prefijo `/api`) con las métricas en formato Prometheus. Lo consume el servicio de Prometheus definido en `docker-compose.yml`.

**Métricas destacadas:**

| Métrica | Tipo | Descripción |
|---------|------|-------------|
| `gamevault_videojuegos_total` | gauge | Total de videojuegos registrados |
| `gamevault_api_request_latency_seconds` | histogram | Latencia de las peticiones de la API (con buckets para p95/p99) |
| `http_server_requests_seconds` | histogram | Métricas estándar de Spring Actuator |

El stack de observabilidad (Prometheus + Grafana) se levanta con Docker Compose. Grafana incluye el dashboard **GameVault Observabilidad** con paneles de throughput, latencia y un gauge. Los puertos y credenciales locales están documentados en el `README.md`.

---

# 11. Manejo de Errores

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
| 401 | No autenticado — falta un token de usuario válido o la API Key en una operación protegida |
| 404 | Recurso no encontrado |
| 409 | Conflicto — nombre duplicado en categoría o plataforma, o usuario ya existente |
| 500 | Error interno del servidor |

---

# 12. Swagger UI

Documentación interactiva disponible en producción:

```
https://game-list-api-rjqftd4irq-uc.a.run.app/swagger-ui/index.html
```

Permite ejecutar peticiones directamente desde el navegador.

---

# 13. Pruebas Realizadas

- Swagger UI (producción)
- Postman (colección manual por endpoint)
- Frontend integrado en Cloud Run
- Pruebas automatizadas del backend (`mvn test`)
- Capturas en [docs/screenshot/](screenshot/)
</content>
</invoke>
