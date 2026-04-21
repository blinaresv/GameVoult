# Documentación de la API

## Game List Cloud

---

# 1. Introducción

La API de Game List Cloud es un servicio REST desarrollado con Spring Boot que permite gestionar videojuegos y categorías mediante operaciones CRUD.

Está diseñada bajo una arquitectura cliente-servidor, donde el frontend consume los datos a través de peticiones HTTP en formato JSON. La API se conecta a una base de datos PostgreSQL en la nube (Cloud SQL), garantizando persistencia, integridad y disponibilidad de la información.

---

# 2. URL Base

```bash
https://game-list-api-rjqftd4irq-uc.a.run.app
```

---

# 3. Modelo de Datos

## Videojuego

```json
{
  "id": 1,
  "titulo": "God of War",
  "plataforma": "PlayStation",
  "anio": 2018,
  "estado": "TERMINADO",
  "categoria": {
    "id": 1,
    "nombre": "Acción"
  }
}
```

---

## Categoría

```json
{
  "id": 1,
  "nombre": "Acción"
}
```

---

# 4. Endpoints de Videojuegos

---

## GET /videojuegos

### Funcionalidad

Este endpoint permite obtener todos los videojuegos almacenados en la base de datos.

No realiza ningún tipo de modificación, únicamente consulta información. Es utilizado principalmente para mostrar listados en el frontend.

---

### Flujo interno

1. El cliente envía una petición HTTP GET.
2. El controlador (VideojuegoController) recibe la solicitud.
3. Se invoca el servicio (VideojuegoService).
4. El servicio consulta el repositorio mediante `findAll()`.
5. El repositorio ejecuta una consulta SQL sobre la base de datos.
6. Se retorna una lista de objetos al cliente en formato JSON.

---

### Request

No requiere parámetros ni body.

---

### Response (200 OK)

```json
[
  {
    "id": 1,
    "titulo": "God of War",
    "plataforma": "PlayStation",
    "anio": 2018,
    "estado": "TERMINADO"
  }
]
```

---

### Posibles errores

* 500 → Error en conexión con base de datos

---

## GET /videojuegos/{id}

### Funcionalidad

Permite obtener un videojuego específico a partir de su identificador único.

Se utiliza para visualizar detalles o validar la existencia de un registro.

---

### Flujo interno

1. El controlador recibe el ID desde la URL.
2. Se envía al servicio.
3. El servicio ejecuta `findById(id)`.
4. Si el videojuego existe:

   * Se retorna el objeto.
5. Si no existe:

   * Se lanza una excepción.
   * Se retorna error 404.

---

### Request

Parámetro:

* id (Long)

---

### Response (200 OK)

```json
{
  "id": 1,
  "titulo": "God of War",
  "plataforma": "PlayStation",
  "anio": 2018,
  "estado": "TERMINADO"
}
```

---

### Error (404)

```json
{
  "error": "Videojuego no encontrado"
}
```

---

## POST /videojuegos

### Funcionalidad

Permite registrar un nuevo videojuego en el sistema.

Este endpoint inserta un nuevo registro en la base de datos y establece la relación con una categoría existente.

---

### Flujo interno

1. El cliente envía un JSON en el body.
2. El controlador recibe el objeto (@RequestBody).
3. El servicio valida:

   * Campos obligatorios
   * Formato de datos
4. Se valida la existencia de la categoría.
5. Se construye la entidad Videojuego.
6. Se guarda con `save()`.
7. Se retorna el objeto creado.

---

### Request Body

```json
{
  "titulo": "The Witcher 3",
  "plataforma": "PC",
  "anio": 2015,
  "estado": "JUGANDO",
  "categoria": {
    "id": 1
  }
}
```

---

### Validaciones

* titulo no vacío
* plataforma obligatoria
* año válido
* categoría existente

---

### Response (201 Created)

```json
{
  "id": 2,
  "titulo": "The Witcher 3",
  "plataforma": "PC",
  "anio": 2015,
  "estado": "JUGANDO"
}
```

---

### Errores

#### 400

```json
{
  "error": "Datos inválidos"
}
```

#### 500

```json
{
  "error": "Error al guardar"
}
```

---

## PUT /videojuegos/{id}

### Funcionalidad

Permite actualizar un videojuego existente.

Se utiliza para modificar datos previamente almacenados sin crear un nuevo registro.

---

### Flujo interno

1. Se recibe ID y body.
2. Se busca el registro.
3. Si no existe → error 404.
4. Si existe:

   * Se actualizan campos.
   * Se guarda nuevamente.
5. Se retorna confirmación.

---

### Request Body

```json
{
  "titulo": "FIFA 25",
  "plataforma": "PS5",
  "anio": 2025,
  "estado": "PENDIENTE"
}
```

---

### Response (200 OK)

```json
{
  "mensaje": "Videojuego actualizado correctamente"
}
```

---

### Errores

```json
{
  "error": "Videojuego no encontrado"
}
```

---

## DELETE /videojuegos/{id}

### Funcionalidad

Permite eliminar un videojuego del sistema.

---

### Flujo interno

1. Se recibe ID.
2. Se valida existencia.
3. Si existe:

   * Se elimina con `deleteById()`.
4. Si no:

   * Error 404.

---

### Response

```json
{
  "mensaje": "Videojuego eliminado correctamente"
}
```

---

### Error

```json
{
  "error": "No encontrado"
}
```

---

## GET /videojuegos/categoria/{categoriaId}

### Funcionalidad

Permite obtener videojuegos filtrados por categoría.

---

### Flujo interno

1. Se recibe ID de categoría.
2. Se ejecuta consulta personalizada.
3. Se retornan resultados filtrados.

---

### Response

```json
[
  {
    "id": 1,
    "titulo": "Zelda"
  }
]
```

---

# 5. Endpoints de Categorías

---

## GET /categorias

Obtiene todas las categorías.

---

## POST /categorias

Crea una nueva categoría.

### Body

```json
{
  "nombre": "RPG"
}
```

---

## DELETE /categorias/{id}

Elimina una categoría existente.

---

# 6. Manejo de Errores

---

## Funcionamiento

Los errores se manejan en:

* Controller → recibe petición
* Service → valida lógica
* Repository → acceso a BD

---

## Tipos

### 400

Datos inválidos

### 404

No encontrado

### 500

Error interno

---

## Estructura

```json
{
  "error": "Descripción del problema"
}
```

---

# 7. Swagger

```bash
https://game-list-api-rjqftd4irq-uc.a.run.app/swagger-ui/index.html
```

---

# 8. Pruebas realizadas

* Swagger
* Postman
* Frontend en Firebase
