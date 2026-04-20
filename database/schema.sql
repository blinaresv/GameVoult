-- ─────────────────────────────────────────────────────────────
-- GameVault — Schema PostgreSQL
-- Cloud SQL (us-central1) | game-list-cloud:us-central1:gamelist-db
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categoria (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS plataforma (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    fabricante  VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS videojuego (
    id           SERIAL PRIMARY KEY,
    titulo       VARCHAR(255) NOT NULL,
    anio         INTEGER,
    descripcion  TEXT,
    imagen_url   VARCHAR(500),
    estado       VARCHAR(20) NOT NULL CHECK (estado IN ('PENDIENTE','JUGANDO','TERMINADO','FAVORITO')),
    categoria_id INTEGER REFERENCES categoria(id),
    plataforma_id INTEGER REFERENCES plataforma(id)
);

CREATE TABLE IF NOT EXISTS resena (
    id             SERIAL PRIMARY KEY,
    comentario     TEXT NOT NULL,
    autor          VARCHAR(100) NOT NULL,
    puntuacion     INTEGER NOT NULL CHECK (puntuacion BETWEEN 1 AND 10),
    videojuego_id  INTEGER NOT NULL REFERENCES videojuego(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlist (
    id            SERIAL PRIMARY KEY,
    titulo        VARCHAR(255) NOT NULL,
    prioridad     VARCHAR(10) NOT NULL CHECK (prioridad IN ('ALTA','MEDIA','BAJA')),
    notas         TEXT,
    plataforma_id INTEGER REFERENCES plataforma(id),
    categoria_id  INTEGER REFERENCES categoria(id)
);
