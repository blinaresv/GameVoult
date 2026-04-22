# GameVault — Gestor de Videojuegos en la Nube

### Sistema colaborativo de gestión de videojuegos con arquitectura cloud

---

## Equipo de Desarrollo

| Rol | Nombre | Responsabilidades |
|-----|--------|-------------------|
| Product Owner / Backend Developer | Brandon Linares | Sprint 1: API REST, base de datos, Wishlist, CI/CD, Swagger |
| Frontend Developer | Jhon Vargas | Sprint 2: UI, búsqueda, detalle, formularios, wishlist UI, estadísticas; Sprint 3: Docker, tablero Kanban |

---

## Descripción del Proyecto

**GameVault** es una aplicación web para gestionar tu biblioteca de videojuegos personales, desplegada íntegramente en Google Cloud Platform. Permite registrar juegos, organizarlos por categoría y plataforma, llevar un seguimiento por estado (PENDIENTE, JUGANDO, TERMINADO, FAVORITO), escribir reseñas con puntuación y mantener una wishlist priorizada.

---

## Arquitectura

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, CSS3, JavaScript (vanilla) |
| Backend | Java 21 + Spring Boot 3.2 (API REST) |
| Base de datos | PostgreSQL 15 (Cloud SQL) |
| Infraestructura | GCP — Cloud Run (backend + frontend unificados) |
| CI/CD | GitHub Actions + Cloud Build (deploy automático a main) |
| Contenedorización | Docker multi-stage (Maven build + JRE Alpine) |

Flujo:
```
Usuario → Cloud Run (Spring Boot sirve frontend + /api/*) → Cloud SQL (PostgreSQL)
```

---

## Sprints Completados

### Sprint 1 — Backend + Base de Datos
| Historia | Descripción | Estado |
|----------|-------------|--------|
| HU-01 | CRUD completo de videojuegos (`/api/videojuegos`) | Completado |
| HU-02 | Clasificación por categorías (`/api/categorias`) | Completado |
| HU-03 | Gestión de plataformas (`/api/plataformas`) | Completado |
| HU-04 | Búsqueda y filtros por título, estado, categoría, plataforma | Completado |
| HU-05 | Configuración de base de datos en Cloud SQL | Completado |
| HU-06 | Sistema de reseñas con puntuación (`/api/resenas`) | Completado |
| HU-18 | Wishlist API con prioridad (`/api/wishlist`) | Completado |

Evidencias: [docs/screenshot/](docs/screenshot/)

### Sprint 2 — Frontend
| Historia | Descripción | Estado |
|----------|-------------|--------|
| HU-07 | Biblioteca visual con tarjetas y badges de estado | Completado |
| HU-08 | Búsqueda en tiempo real y filtros combinados | Completado |
| HU-09 | Página de detalle con reseñas y promedio | Completado |
| HU-10 | Formulario de agregar/editar videojuego | Completado |
| HU-11 | Lista de deseos (Wishlist) con prioridades visuales | Completado |
| HU-12 | Estadísticas del dashboard por estado | Completado |
| HU-19 | Rediseño visual del frontend (CSS/HTML base) | Completado |

Evidencias: [docs/screenshot/frontend.png](docs/screenshot/frontend.png)

### Sprint 3 — Despliegue, Docker y Documentación
| Historia | Descripción | Estado |
|----------|-------------|--------|
| HU-13 | Contenedor Docker unificado (backend + frontend) | Completado |
| HU-14 | CI/CD con Cloud Build y GitHub Actions | Completado |
| HU-15 | Tablero Kanban en GitHub Projects | Completado |
| HU-16 | Documentación completa del proyecto | En progreso |
| HU-17 | Manejo de errores y Swagger con HTTPS | Completado |

Evidencias: [docs/screenshot/cloud-run.png](docs/screenshot/cloud-run.png) · [docs/screenshot/swagger.png](docs/screenshot/swagger.png)

---

## Lecciones Aprendidas

- **Empezar simple en infraestructura**: iniciamos con Firebase Hosting + Cloud Run como dos servicios separados. Mantenerlos sincronizados generó problemas de CORS, doble deploy y complejidad innecesaria. Migrar a un contenedor Docker unificado en el Sprint 3 fue la decisión correcta, aunque idealmente hubiera sido la arquitectura desde el inicio.

- **Hibernate 6 rompe queries JPQL del tutorial**: muchos ejemplos de Spring Boot 3 en internet usan anotaciones `@Query` con JPQL que eran válidas en Hibernate 5. En Hibernate 6 (incluido en Spring Boot 3) el parser es más estricto. Terminamos reemplazando las queries problemáticas con `stream().filter()` hasta identificar la sintaxis correcta.

- **No refactorizar a medias**: al reorganizar los paquetes del backend quedaron dos clases `Application` activas al mismo tiempo, causando `ConflictingBeanDefinitionException` en tiempo de arranque. La lección es completar cualquier refactorización antes de hacer commit o hacer el cambio en una sola operación atómica.

- **GitHub Actions necesita permisos explícitos para Projects V2**: el `GITHUB_TOKEN` por defecto no puede escribir en tableros Projects V2. Dedicamos varios commits a debuggear el workflow hasta entender que requería un Personal Access Token con scope `project` configurado como secret.

- **Los conflictos de merge en archivos grandes son riesgosos**: el conflicto en `index.html` resultó en el contenido de `app.js` sobreescribiendo el HTML, corrompiendo el archivo por completo. Desde entonces aplicamos la práctica de hacer `git pull` antes de empezar cualquier cambio y resolver conflictos archivo por archivo con revisión cuidadosa.

- **Encoding desde el principio**: los emojis en `app.js` funcionaban localmente pero fallaban en el build de Docker porque el contenedor Alpine no tenía el mismo locale. Definir `charset=UTF-8` en el HTML y usar escapes Unicode en JS elimina la dependencia del entorno.

---

## 1. Introducción y Contexto del Proyecto

# 1. Introducción y Contexto del Proyecto

En la actualidad, la cantidad de videojuegos en diferentes plataformas PC, Consolas y celulares hace que sea necesario centralizar la información en un único sistema, desde cualquier lugar.

**Game List Cloud** es un sistema de videojuegos basado en computación en la nube que permite la gestión de un catálogo de videojuegos de manera persistente, segura, y escalable.

El sistema permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en una base de datos relacional, garantizando la integridad de la información, la disponibilidad del servicio, y la seguridad.

Dado que no es una aplicación tradicional, el sistema ha sido diseñado bajo una arquitectura desacoplada, en la que frontend, backend, y la base de datos actúan como entidades independientes, conectadas por servicios cloud.

---

## 2. Objetivo del Proyecto

### Objetivo General

Desarrollar una aplicación web desplegada en la nube que permita gestionar videojuegos mediante una arquitectura moderna basada en servicios cloud.

### Objetivos Específicos

* Diseñar e implementar una API REST utilizando Spring Boot
* Construir una interfaz web funcional para interacción del usuario
* Integrar una base de datos PostgreSQL en la nube
* Desplegar la aplicación utilizando servicios administrados de Google Cloud
* Aplicar buenas prácticas de desarrollo colaborativo con Git

---

## 3. Justificación Técnica

El proyecto fue diseñado con tecnologías que garantizan estabilidad, escalabilidad y facilidad de mantenimiento:

### Backend: Java 21 + Spring Boot

Se utilizó Java 21 por ser una versión LTS que ofrece mejoras en rendimiento y concurrencia.
Spring Boot permite desarrollar APIs REST de forma rápida mediante inyección de dependencias y configuración automática, reduciendo la complejidad del desarrollo.

### Base de Datos: PostgreSQL (Cloud SQL)

PostgreSQL fue elegido por su cumplimiento de propiedades ACID, lo que garantiza consistencia e integridad de los datos.
El uso de Cloud SQL permite delegar la administración del servidor a Google, incluyendo actualizaciones, backups automáticos y alta disponibilidad.

### Contenedorización: Docker

Se utilizó Docker para empaquetar la aplicación backend junto con todas sus dependencias, asegurando que el sistema funcione de la misma manera en cualquier entorno.

### Ejecución en la nube: Cloud Run

Cloud Run permite ejecutar contenedores de forma serverless, lo que significa que la aplicación escala automáticamente según la demanda y puede incluso escalar a cero cuando no hay uso.

### Frontend: Spring Boot Static Resources (Cloud Run)

El frontend (HTML, CSS, JS) se empaqueta dentro del mismo contenedor Docker en la etapa de build, copiándose a `src/main/resources/static/`. Spring Boot lo sirve como contenido estático desde la raíz `/`, mientras que la API REST responde en `/api/*`. Esto elimina la necesidad de un servicio externo de hosting y simplifica el despliegue a una sola URL.

---

## 4. Arquitectura del Sistema

El sistema sigue una arquitectura de tres capas, empaquetadas en un único contenedor Docker desplegado en Cloud Run:

1. **Capa de presentación (Frontend)**
   Desarrollada en HTML, CSS y JavaScript. Se incluye en el `.jar` de Spring Boot como recurso estático y se sirve desde la raíz `/`.

2. **Capa de lógica de negocio (Backend)**
   API REST desarrollada con Spring Boot, encargada de procesar solicitudes, validar datos y ejecutar la lógica del sistema. Responde bajo `/api/*`.

3. **Capa de persistencia (Base de datos)**
   Base de datos PostgreSQL administrada en Cloud SQL, conectada mediante Cloud SQL Socket Factory (sin TCP directo).

### Flujo de comunicación:

```
Usuario → Cloud Run (Puerto 8080)
             ├── GET /          → Spring Boot sirve index.html (frontend estático)
             ├── GET /api/**    → Controladores REST (lógica de negocio)
             └── Cloud SQL Socket → PostgreSQL (gamelist DB)
```

---

## 5. Stack Tecnológico

* Java 21
* Spring Boot
* PostgreSQL
* HTML5, CSS3, JavaScript
* Maven
* Docker
* Git y GitHub
* Google Cloud Platform

---

## 6. Servicios Cloud Implementados

Durante el desarrollo se utilizaron los siguientes servicios de Google Cloud:

* **Cloud Run:** despliegue del contenedor Docker unificado (frontend + backend + static assets)
* **Cloud SQL:** base de datos PostgreSQL administrada (instancia `gamevoult-db`, región `us-central1`)
* **Artifact Registry:** almacenamiento de imágenes Docker construidas por Cloud Build
* **Cloud Build:** pipeline de CI/CD que construye y despliega automáticamente al hacer push a `main`

> **Nota:** Firebase Hosting se utilizó en una etapa inicial del proyecto para servir el frontend de forma independiente. En el Sprint 3 (HU-13) fue reemplazado por un Dockerfile multi-stage que empaqueta frontend y backend en un solo contenedor, simplificando la arquitectura y reduciendo el número de servicios en producción.

---

## 7. URLs del Sistema

Todo el sistema se sirve desde una única URL en Cloud Run:

* **Aplicación completa (frontend + API):**
  https://game-list-api-rjqftd4irq-uc.a.run.app

* **Swagger UI:**
  https://game-list-api-rjqftd4irq-uc.a.run.app/swagger-ui/index.html

> La URL de Firebase Hosting (`https://game-list-cloud-bccbc.web.app`) ya no está activa. Fue descontinuada al migrar a la arquitectura Docker unificada.

---

## 8. Organización del Repositorio

```bash
/backend    → Código fuente del backend (Spring Boot)
/frontend   → Interfaz web
/database   → Scripts SQL
/docs       → Documentación y evidencias
```

---

## 9. Instalación Local 

Para ejecutar el proyecto localmente, se deben seguir los siguientes pasos:

### 1. Clonar el repositorio

```bash
git clone https://github.com/blinaresv/Game_list_cloud.git
```

### 2. Configurar la base de datos

Se debe contar con una instancia de PostgreSQL local o en la nube.
Luego, configurar las credenciales en:

```bash
backend/src/main/resources/application.properties
```

### 3. Ejecutar el backend

```bash
cd backend
mvn clean spring-boot:run
```

Esto levantará el servidor en:
http://localhost:8080

### 4. Ejecutar el frontend

Abrir el archivo:

```bash
frontend/index.html
```

en cualquier navegador.

---

## 10. Proceso de Despliegue en la Nube 

El despliegue del sistema se realizó utilizando Google Cloud Platform bajo un enfoque de integración continua, permitiendo automatizar la construcción y ejecución del backend a partir del repositorio en GitHub.

### 1. Creación de la Base de Datos (Cloud SQL)

Inicialmente se configuró una instancia de PostgreSQL en Cloud SQL:

* Se creó la instancia desde la consola de Google Cloud
* Se habilitó el acceso mediante IP pública
* Se definió la base de datos `gamelist`
* Se ejecutaron scripts SQL para la creación de tablas

Esto permitió contar con una base de datos administrada, sin necesidad de gestionar servidores manualmente.

### 2. Configuración del Backend

Se configuró el archivo:

```bash
application.properties
```

Incluyendo:

* URL de conexión a la base de datos
* Usuario y contraseña
* Configuración de JPA

Además, se validó la conexión de manera local antes de realizar el despliegue en la nube.

### 3. Contenerización con Docker

Se creó un archivo:

```bash
Dockerfile
```

Este archivo define:

* La imagen base de Java
* La copia del proyecto
* La ejecución del comando Maven para generar el `.jar`
* El comando de arranque de la aplicación

Esto permite que la aplicación se ejecute en un entorno aislado y reproducible.

### 4. Integración con GitHub 

El repositorio del proyecto fue conectado directamente con Google Cloud mediante Developer Connect, lo que permitió:

* Clonar automáticamente el repositorio
* Detectar cambios en la rama principal (`main`)
* Ejecutar procesos de build de forma automática

Durante este proceso, Google Cloud genera internamente un archivo de configuración tipo:

```bash
cloudbuild.yaml
```

Este archivo define los pasos de construcción del contenedor, incluyendo:

* Descarga del código fuente
* Construcción de la imagen Docker
* Publicación de la imagen en Artifact Registry
* Despliegue automático en Cloud Run

### 5. Activador de despliegue (Trigger)

Se configuró un activador trigger que permite que cada vez que se realiza un `git push` al repositorio:

* Se dispare automáticamente el proceso de build
* Se reconstruya el contenedor
* Se actualice el servicio en Cloud Run

Esto implementa un flujo de Integración Continua (CI/CD).

### 6. Despliegue en Cloud Run

El servicio fue configurado con las siguientes características:

* Puerto: 8080
* Acceso público habilitado
* Escalado automático
* Ejecución serverless

Cloud Run se encarga de:

* Ejecutar el contenedor
* Escalar según demanda
* Gestionar la infraestructura

### 7. Integración del Frontend en el Contenedor (Docker multi-stage)

El frontend se empaqueta directamente dentro del contenedor junto al backend. El `Dockerfile` raíz tiene dos etapas:

```dockerfile
# Etapa 1: compilar el backend con Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/ ./backend/
COPY frontend/ ./backend/src/main/resources/static/
RUN mvn -f backend/pom.xml clean package -DskipTests

# Etapa 2: imagen final ligera con solo el JRE
FROM eclipse-temurin:21-jre-alpine
COPY --from=build /app/backend/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

Con esto, Spring Boot sirve el `index.html` desde `/` y la API desde `/api/*`, todo en el mismo puerto 8080 y la misma URL de Cloud Run.

> En versiones anteriores del proyecto se usó Firebase Hosting para el frontend. Fue eliminado en el Sprint 3 para simplificar el despliegue a una sola URL.

### 8. Integración Final del Sistema

Finalmente, se conectó el frontend con el backend utilizando la URL pública de Cloud Run, permitiendo que las peticiones HTTP consuman la API desplegada.

De esta manera, se logró un sistema completamente funcional en la nube, donde:

```
Frontend → Backend → Base de datos
```

opera de forma integrada y escalable.

---

## 11. Credenciales de prueba

* Usuario: postgres
* Contraseña: configurada en Cloud SQL

---

## 12. Problemas Encontrados y Soluciones

### Problema 1: Clase `main` duplicada — `ConflictingBeanDefinitionException`

* Causa: existían dos paquetes con clase `Application` (`com.gamelist` y `com.gamelist.gamelist_api`), legacy de una refactorización parcial
* Solución: eliminar el paquete duplicado `gamelist_api` y especificar `<mainClass>` explícitamente en `pom.xml`

---

### Problema 2: JPQL incompatible con Hibernate 6 / Spring Boot 3

* Causa: queries `@Query` con JPQL usaban sintaxis que Hibernate 6 ya no acepta
* Solución: reemplazar las queries por `stream().filter()` en los controladores para los casos de filtros dinámicos

---

### Problema 3: Swagger generaba URLs con `http://` en Cloud Run

* Causa: Cloud Run termina TLS en el proxy y reenvía al contenedor como HTTP; Spring Boot no detectaba el esquema real
* Solución: agregar `server.forward-headers-strategy=framework` en `application.properties`

---

### Problema 4: CORS al tener frontend y backend en dominios diferentes

* Causa: en la etapa inicial con Firebase Hosting (`web.app`) y Cloud Run en dominios distintos
* Solución: configuración global de CORS en `AppConfig.java` con `allowedOrigins("*")`. Al migrar a la arquitectura unificada, el problema desapareció completamente

---

### Problema 5: GitHub Actions — `GITHUB_TOKEN` sin permisos para GitHub Projects V2

* Causa: el token predeterminado de Actions no puede modificar tableros de tipo Projects V2
* Solución: crear un Personal Access Token con scope `project`, guardarlo como secret `PROJECT_TOKEN` y usarlo en el workflow de automatización del Kanban

---

### Problema 6: Instancia Cloud SQL renombrada durante el proyecto

* Causa: la instancia inicial `gamelist-db` fue reconstruida y renombrada a `gamevoult-db`
* Solución: actualizar la variable de entorno `INSTANCE_CONNECTION_NAME` en Cloud Run y en el workflow de CI/CD

---

### Problema 7: Conflicto de merge — `index.html` corrompido

* Causa: un merge entre ramas con cambios en `index.html` y `app.js` resultó en el contenido de `app.js` dentro de `index.html`
* Solución: restaurar el archivo desde el historial de git con el contenido HTML correcto

---

### Problema 8: Emojis y caracteres UTF-8 en `app.js`

* Causa: el encoding del archivo causaba que algunos emojis en el JS se mostraran como caracteres corruptos en ciertos entornos
* Solución: reemplazar los emojis directos por escapes Unicode (`🎮`) y agregar `charset=UTF-8` en el `<script>` tag

---

## 13. Evidencia de Funcionamiento

Las capturas del sistema se encuentran en:

docs/screenshots/

Incluyen:

* CRUD funcionando
* Swagger
* Base de datos
* Despliegue en Cloud

---

## 14. Documentación Adicional

* API: docs/api-documentation.md
* Despliegue detallado: docs/deployment-guide.md

---

## 15. Conclusiones

El proyecto demuestra la implementación de una arquitectura moderna basada en servicios cloud, logrando escalabilidad, disponibilidad y desacoplamiento entre componentes.

Se logró integrar correctamente frontend, backend y base de datos en un entorno real de producción.

---

## 16. Trabajo Futuro

* Implementar autenticación con JWT
* Añadir pruebas unitarias
* Optimizar consultas con caché
* Mejorar interfaz de usuario

---

## 17. Métricas del Proyecto

| Sprint | Historias planificadas | Completadas | Velocidad (puntos) |
|--------|----------------------|-------------|-------------------|
| Sprint 1 | 7 | 7 | 25 pts |
| Sprint 2 | 6 | 6 | 21 pts |
| Sprint 3 | 5 | 5 | 18 pts |
| **Total** | **18** | **18** | **64 pts** |

---

## 18. Enlaces Importantes

- [Aplicación en producción](https://game-list-api-rjqftd4irq-uc.a.run.app)
- [Swagger UI](https://game-list-api-rjqftd4irq-uc.a.run.app/swagger-ui/index.html)
- [GitHub Project (Kanban)](https://github.com/blinaresv/Game_list_cloud/projects)
- [Documentación de la API](docs/api-documentation.md)
- [Guía de despliegue](docs/deployment-guide.md)

---
