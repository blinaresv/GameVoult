# Guía de Despliegue

## GameVoult — Gestor de Videojuegos

---

# 1. Introducción

Esta guía describe el proceso completo de despliegue de **GameVoult** en Google Cloud Platform, incluyendo la configuración de la base de datos, el backend, el frontend y la integración continua mediante Cloud Build.

El objetivo es garantizar que cualquier persona pueda replicar el despliegue siguiendo estos pasos.

---

# 2. Arquitectura de Despliegue

El sistema usa una arquitectura **unificada**: el frontend (HTML/CSS/JS) está empaquetado dentro de la imagen Docker junto con el backend (Spring Boot). Cloud Run sirve ambos desde el mismo contenedor.

```
Usuario → Cloud Run (Spring Boot)
               ├── /          → Frontend (recursos estáticos)
               └── /api/      → Backend (REST API)
                      └── Cloud SQL (PostgreSQL)
```

**Servicios GCP:**

| Servicio | Nombre | Región |
|---|---|---|
| Cloud Run | `gamevoult` | us-central1 |
| Cloud SQL | `gamevoult-db` | us-central1 |
| Artifact Registry | `cloud-run-source-deploy` | us-central1 |
| Proyecto GCP | `game-list-cloud-493923` | — |

> Firebase Hosting **no se usa** en este proyecto. El frontend se sirve directamente desde Cloud Run.

---

# 3. Configuración de Base de Datos (Cloud SQL)

---

## 3.1 Creación de instancia

1. Ingresar a Google Cloud Console
2. Ir a **Cloud SQL**
3. Crear nueva instancia PostgreSQL:
   - Nombre: `gamevoult-db`
   - Versión: PostgreSQL 15
   - Región: `us-central1`
   - Connection name: `game-list-cloud-493923:us-central1:gamevoult-db`

---

## 3.2 Configuración de acceso

- Conexión via **Cloud SQL Socket Factory** (sin IP pública, sin TCP)
- No se requiere autorizar IPs externas
- Usuario: `postgres`
- Contraseña: configurada como variable de entorno en Cloud Run

---

## 3.3 Creación de base de datos

- Nombre: `gamelist`

---

## 3.4 Creación de tablas

Se ejecutaron los scripts en `database/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS categoria (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS plataforma (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    fabricante  VARCHAR(100)
);

-- Usuarios (Proyecto 3): login/registro y aislamiento de datos por usuario
CREATE TABLE IF NOT EXISTS usuario_app (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(30) NOT NULL UNIQUE,
    display_name  VARCHAR(80),
    password_hash VARCHAR(260) NOT NULL,
    role          VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN','USER')),
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videojuego (
    id            SERIAL PRIMARY KEY,
    titulo        VARCHAR(255) NOT NULL,
    anio          INTEGER,
    descripcion   TEXT,
    imagen_url    TEXT,
    estado        VARCHAR(20) NOT NULL CHECK (estado IN ('PENDIENTE','JUGANDO','TERMINADO','FAVORITO')),
    usuario_id    INTEGER REFERENCES usuario_app(id),
    categoria_id  INTEGER REFERENCES categoria(id),
    plataforma_id INTEGER REFERENCES plataforma(id)
);
CREATE INDEX IF NOT EXISTS idx_videojuego_usuario ON videojuego(usuario_id);

CREATE TABLE IF NOT EXISTS resena (
    id            SERIAL PRIMARY KEY,
    comentario    TEXT NOT NULL,
    autor         VARCHAR(100) NOT NULL,
    puntuacion    INTEGER NOT NULL CHECK (puntuacion BETWEEN 1 AND 10),
    videojuego_id INTEGER NOT NULL REFERENCES videojuego(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlist (
    id            SERIAL PRIMARY KEY,
    titulo        VARCHAR(255) NOT NULL,
    prioridad     VARCHAR(10) NOT NULL CHECK (prioridad IN ('ALTA','MEDIA','BAJA')),
    notas         TEXT,
    usuario_id    INTEGER REFERENCES usuario_app(id),
    plataforma_id INTEGER REFERENCES plataforma(id),
    categoria_id  INTEGER REFERENCES categoria(id)
);
CREATE INDEX IF NOT EXISTS idx_wishlist_usuario ON wishlist(usuario_id);
```

> En bases de datos ya existentes, las columnas `usuario_id` se agregan con `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (ver comentarios en `database/schema.sql`). Los datos previos quedan sin dueño; cada usuario verá solo lo que cree tras la migración.

---

# 4. Configuración del Backend

---

## 4.1 Archivo application.properties

```properties
spring.application.name=gamelist-api

# Puerto dinámico para Cloud Run
server.port=${PORT:8080}

# Cloud SQL — conexión via Socket Factory (sin TCP directo)
spring.datasource.url=jdbc:postgresql:///gamelist?cloudSqlInstance=${INSTANCE_CONNECTION_NAME}&socketFactory=com.google.cloud.sql.postgres.SocketFactory
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}

# Pool de conexiones (máximo 2 para plan básico de Cloud SQL)
spring.datasource.hikari.maximum-pool-size=2

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Swagger HTTPS en Cloud Run
server.forward-headers-strategy=framework

# Autenticación y API Key (Proyecto 3) — se leen de variables de entorno
app.api-key=${API_KEY:dev-gamevault-key}
app.admin.username=${ADMIN_USERNAME:admin}
app.admin.password=${ADMIN_PASSWORD:admin123}
app.auth.token-secret=${AUTH_TOKEN_SECRET:dev-gamevault-secret}
app.auth.token-ttl-minutes=${AUTH_TOKEN_TTL_MINUTES:480}

# Monitoreo con Actuator + Prometheus (Proyecto 3)
management.endpoints.web.exposure.include=health,info,prometheus
management.endpoints.web.path-mapping.prometheus=metrics
```

Las variables de entorno `DB_USER`, `DB_PASSWORD` e `INSTANCE_CONNECTION_NAME` se configuran directamente en Cloud Run (no en el código). A partir del Proyecto 3 se añaden `API_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` y `AUTH_TOKEN_SECRET` (los valores de demostración solo deben usarse en local; en producción deben ser secretos reales).

---

## 4.2 Validación local

```bash
cd backend
mvn spring-boot:run
```

Para probar localmente con base de datos local, configurar un `application-local.properties` con URL JDBC tradicional.

---

# 5. Contenerización con Docker

---

## 5.1 Dockerfile (multi-stage unificado)

El Dockerfile empaqueta frontend y backend en una sola imagen:

```dockerfile
# Etapa 1: Build con Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B
COPY backend/src ./src
# El frontend se copia a los recursos estáticos de Spring Boot
COPY frontend/ ./src/main/resources/static/
RUN mvn clean package -Dmaven.test.skip=true

# Etapa 2: Imagen de runtime liviana
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Spring Boot sirve los archivos del frontend en `/` y la API en `/api/` automáticamente.

> El Dockerfile usa `-Dmaven.test.skip=true` para no compilar ni ejecutar las pruebas dentro de la imagen de producción; los tests se ejecutan aparte con `mvn test` (CI).

---

## 5.2 API_URL en el frontend

Dado que frontend y backend comparten el mismo origen en Cloud Run, el frontend usa una URL relativa:

```javascript
// En Docker/Cloud Run → ruta relativa (mismo origen)
// En local con Live Server → URL absoluta al backend local
const API_URL = (window.location.hostname === 'localhost' && window.location.port !== '8080')
  ? 'http://localhost:8080/api'
  : '/api';
```

---

## 5.3 Stack local con Docker Compose (monitoreo)

Para ejecutar y observar el sistema en local se usa `docker-compose.yml`, que levanta cuatro servicios: PostgreSQL, el backend, Prometheus y Grafana.

```bash
docker compose up --build -d
```

| Servicio | URL local | Notas |
|---|---|---|
| Aplicación (frontend + API) | http://localhost:8080 | Login con `admin` / `admin123` |
| Métricas de la API | http://localhost:8080/metrics | Formato Prometheus |
| Prometheus | http://localhost:9090 | Scrapea `backend:8080/metrics` |
| Grafana | http://localhost:3000 | `admin` / `admin`; dashboard **GameVault Observabilidad** |

Las credenciales y secretos del stack local se pasan como variables de entorno en el propio `docker-compose.yml` (`API_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_TOKEN_SECRET`). Para generar tráfico de prueba que alimente los paneles de Grafana se usa `scripts/generate-traffic.ps1`.

> Este stack es solo para entorno local/sustentación (HTTP). El despliegue productivo sigue siendo Cloud Run + Cloud SQL descrito en las secciones siguientes.

---

# 6. Integración Continua (CI/CD)

---

## 6.1 Flujo de despliegue

```
Push a main → Cloud Build Trigger → cloudbuild.yaml → Cloud Run
```

GitHub Actions en este proyecto solo notifica que el deploy fue iniciado. El CI/CD real lo ejecuta **Cloud Build** mediante un trigger configurado en GCP.

---

## 6.2 Archivo cloudbuild.yaml

```yaml
steps:
  # 1. Construir imagen Docker unificada (backend + frontend)
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'us-central1-docker.pkg.dev/game-list-cloud-493923/cloud-run-source-deploy/gamevoult:$COMMIT_SHA'
      - '-t'
      - 'us-central1-docker.pkg.dev/game-list-cloud-493923/cloud-run-source-deploy/gamevoult:latest'
      - '.'

  # 2. Push al Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - '--all-tags'
      - 'us-central1-docker.pkg.dev/game-list-cloud-493923/cloud-run-source-deploy/gamevoult'

  # 3. Deploy a Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'services'
      - 'update'
      - 'gamevoult'
      - '--image=us-central1-docker.pkg.dev/game-list-cloud-493923/cloud-run-source-deploy/gamevoult:$COMMIT_SHA'
      - '--region=us-central1'
      - '--add-cloudsql-instances=game-list-cloud-493923:us-central1:gamevoult-db'
      - '--set-env-vars=DB_NAME=gamelist,DB_USER=$_DB_USER,DB_PASSWORD=$_DB_PASSWORD,INSTANCE_CONNECTION_NAME=game-list-cloud-493923:us-central1:gamevoult-db'
      - '--quiet'
```

---

## 6.3 Trigger de Cloud Build

El trigger está configurado en GCP para detectar cambios en la rama `main` del repositorio GitHub. Al recibir el push, ejecuta `cloudbuild.yaml` automáticamente.

---

# 7. Despliegue en Cloud Run

---

## 7.1 Servicio

- Nombre: `gamevoult`
- Región: `us-central1`
- Puerto: `8080`
- Acceso: público (sin autenticación)
- Escalado automático habilitado

---

## 7.2 Variables de entorno en Cloud Run

| Variable | Valor |
|---|---|
| `DB_NAME` | `gamelist` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | (valor seguro en Cloud Run) |
| `INSTANCE_CONNECTION_NAME` | `game-list-cloud-493923:us-central1:gamevoult-db` |
| `API_KEY` | (clave de respaldo para escrituras de recursos compartidos) |
| `ADMIN_USERNAME` | (usuario administrador inicial) |
| `ADMIN_PASSWORD` | (contraseña del administrador inicial) |
| `AUTH_TOKEN_SECRET` | (clave de firma de los tokens de sesión) |

> Las cuatro últimas variables se incorporan en el Proyecto 3. En producción deben ser valores secretos reales (idealmente gestionados con Secret Manager), nunca los valores de demostración.

---

## 7.3 Proceso de despliegue

1. Push a `main` en GitHub
2. Cloud Build Trigger detecta el cambio
3. Ejecuta `cloudbuild.yaml`:
   - Construye la imagen Docker (frontend + backend juntos)
   - Publica la imagen en Artifact Registry con tag `$COMMIT_SHA` y `latest`
   - Actualiza el servicio Cloud Run con la nueva imagen
4. Cloud Run reemplaza el contenedor sin downtime

---

# 8. Problemas Encontrados

---

## Problema 1: JAR no encontrado en Docker

- **Causa:** ruta del `.jar` incorrecta en el Dockerfile
- **Solución:** uso de `COPY --from=build /app/target/*.jar app.jar` con wildcard

---

## Problema 2: Conexión a Cloud SQL fallida

- **Causa:** intentar conexión TCP directa; Cloud SQL bloqueaba la IP
- **Solución:** migrar a Cloud SQL Socket Factory (sin IP, sin TCP)

---

## Problema 3: CORS

- **Causa:** frontend y backend en orígenes distintos durante desarrollo local
- **Solución:** `allowedOrigins("*")` en `AppConfig.java`; en producción no hay CORS porque comparten origen

---

## Problema 4: Swagger con URLs HTTP en Cloud Run

- **Causa:** Cloud Run recibe tráfico HTTP internamente aunque externamente sea HTTPS
- **Solución:** `server.forward-headers-strategy=framework` en `application.properties`

---

## Problema 5: Archivos `.DS_Store` en git

- **Causa:** macOS genera este archivo automáticamente
- **Solución:** agregado a `.gitignore`

---

# 9. Validación del Sistema

Se realizaron pruebas mediante:

- **Swagger UI** — verificación de endpoints REST
- **Frontend** — flujo completo de CRUD de videojuegos, reseñas y wishlist

Se verificó:

- CRUD completo de videojuegos, categorías, plataformas, reseñas y wishlist
- Conexión a Cloud SQL via Socket Factory
- Persistencia de datos entre reinicios del contenedor
- Frontend servido correctamente desde Spring Boot
- Login/registro de usuarios y rechazo con 401 sin credenciales (Proyecto 3)
- Aislamiento de datos por usuario en videojuegos, wishlist y reseñas
- Exportación de videojuegos a CSV desde el frontend
- Métricas en `/metrics` recolectadas por Prometheus y visibles en Grafana

---

# 10. URLs Finales

| Recurso | URL |
|---|---|
| Aplicación (frontend + API) | https://gamevoult-289395988346.us-central1.run.app |
| Swagger UI | https://gamevoult-289395988346.us-central1.run.app/swagger-ui/index.html |
| API docs | https://gamevoult-289395988346.us-central1.run.app/v3/api-docs |

---

# 11. Conclusión

GameVoult implementa una arquitectura cloud unificada: frontend y backend conviven en un solo contenedor Docker desplegado en Cloud Run, conectado a Cloud SQL mediante Socket Factory. El CI/CD via Cloud Build automatiza el build y despliegue con cada push a `main`, garantizando entregas consistentes sin intervención manual.
