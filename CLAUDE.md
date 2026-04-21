# CLAUDE.md — GameVault (Persona 1: Backend + BD)

## Instalación de skills al iniciar
Ejecuta estos comandos ANTES de cualquier tarea:

```bash
npx claude-code-templates@latest --skill development/senior-backend
npx claude-code-templates@latest --skill development/senior-frontend
npx claude-code-templates@latest --skill creative-design/ui-ux-pro-max
npx claude-code-templates@latest --skill business-marketing/seo-optimizer
```

> ⚠️ Si algún skill no instala, continúa igual — úsalos como guía de calidad:
> arquitectura limpia, separación de capas, código legible, UX consistente.

---

## ⚠️ MODO DE TRABAJO — LEE ESTO PRIMERO

**Claude Code crea la rama y escribe el código. Los commits, el push y el PR los haces TÚ.**

El flujo exacto por cada historia:
1. Dices: "trabaja en HU-XX"
2. Claude Code lee los criterios de `docs/HISTORIAS_USUARIO.md`
3. **Claude Code ejecuta `git checkout -b feature/...`** para crear y posicionarse en la rama ANTES de tocar cualquier archivo
4. Claude Code escribe o modifica únicamente los archivos de esa historia (ya dentro de la rama)
5. Al terminar, muestra el **bloque de comandos** con los `git add` y `git commit` para que TÚ los ejecutes
6. Tú haces el `git push` y abres el PR desde VS Code

**Resumen de responsabilidades:**
- Claude Code → crea la rama + escribe el código
- Tú → `git add`, `git commit`, `git push`, abrir PR

---

## Cómo abrir un Pull Request desde VS Code (sin ir al navegador)

Instala la extensión oficial: **GitHub Pull Requests** (de GitHub, Inc.)

Pasos después de hacer `git push`:
1. En VS Code, clic en el ícono de GitHub en la barra lateral izquierda (octocat)
2. Clic en **"Create Pull Request"**
3. Llena los campos:
   - **Base:** `development`
   - **Compare:** tu rama `feature/...`
   - **Title:** `[Sprint N] feat: descripción`
   - **Description:** `closes #N`
4. Clic en **"Create"**

> También: abre la paleta con `Ctrl+Shift+P` y busca `GitHub Pull Requests: Create Pull Request`

---

## Contexto del proyecto
- **Nombre:** GameVault — Gestor de Videojuegos
- **Stack:** Spring Boot 3.2 (Java 21) + HTML/CSS/JS + PostgreSQL 15
- **Cloud:** GCP (Cloud Run + Cloud SQL, región us-central1)
- **Metodología:** Kanban, 3 sprints, una rama feature por historia de usuario
- **Mi rol:** Backend Developer + Product Owner (Persona 1)

---

## Estructura del repositorio
```
GameVault/
├── CLAUDE.md
├── Dockerfile                  # Multi-stage: Maven build + JRE Alpine
├── cloudbuild.yaml             # CI/CD con Cloud Build
├── README.md
├── .github/workflows/
│   ├── kanban-automation.yml   # Mueve cards del Kanban automáticamente
│   └── deploy.yml              # Deploy a Cloud Run al hacer push a main
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/gamelist/
│       │   ├── GameListApplication.java
│       │   ├── AppConfig.java              # CORS + Swagger config
│       │   ├── model/Models.java           # Entidades JPA
│       │   ├── repository/Repositories.java
│       │   ├── controller/Controllers.java
│       │   └── exception/GlobalExceptionHandler.java
│       └── resources/application.properties
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── diagram.png
└── docs/
    ├── HISTORIAS_USUARIO.md    # ← LEER ANTES DE CADA TAREA
    ├── GUIA_GITHUB_PROJECTS.md
    └── PLAN_COMMITS.sh
```

---

## Reglas de Git — OBLIGATORIAS

### Estructura de ramas
```
main          → producción final (NO tocar directamente)
development   → integración (base para crear feature/*)
feature/*     → una rama por historia de usuario (temporal)
```

### NUNCA hacer esto
- ❌ Nunca commit directo a `main` o `development`
- ❌ Nunca mezclar cambios de dos historias en una misma rama
- ❌ Nunca hacer push sin que el código compile
- ❌ Claude Code nunca ejecuta git — solo muestra los comandos

---

## Mis historias de usuario (Sprint 1 y partes del Sprint 3)

Lee los criterios completos en `docs/HISTORIAS_USUARIO.md`

| # | Historia | Rama | Issue | Sprint |
|---|---|---|---|---|
| HU-01 | CRUD Videojuegos | `feature/sprint1-backend-videojuegos` | #1 | 1 |
| HU-02 | Categorías | `feature/sprint1-backend-categorias` | #2 | 1 |
| HU-03 | Plataformas | `feature/sprint1-backend-plataformas` | #3 | 1 |
| HU-04 | Búsqueda y filtros API | `feature/sprint1-backend-filtros` | #4 | 1 |
| HU-05 | Cloud SQL setup | `feature/sprint1-database-setup` | #5 | 1 |
| HU-06 | Reseñas | `feature/sprint1-backend-resenas` | #6 | 1 |
| HU-18 | Wishlist API | `feature/sprint1-backend-wishlist` | #18 | 1 |
| HU-14 | CI/CD GitHub Actions | `feature/sprint3-cicd` | #14 | 3 |
| HU-17 | Swagger HTTPS + errores | `feature/sprint3-backend-fixes` | #17 | 3 |

---

## Cómo procesar cada historia

Cuando el usuario diga "trabaja en HU-XX":

1. **Leer** los criterios de aceptación en `docs/HISTORIAS_USUARIO.md`
2. **Revisar** el código existente relacionado antes de modificar
3. **Crear la rama** ejecutando:
   ```bash
   git checkout development && git pull origin development
   git checkout -b feature/sprintN-nombre-historia
   ```
   Esto garantiza que todos los archivos modificados queden dentro de la rama desde el inicio.
4. **Aplicar los skills instalados** como guía de calidad al escribir el código:
   - `senior-backend` → arquitectura por capas, manejo de excepciones, DTOs si aplica
   - `senior-frontend` → JS modular, manejo de errores de API, UX fluida
   - `ui-ux-pro-max` → si hay cambios visuales, cuidar consistencia de diseño
5. **Escribir o modificar** solo los archivos de esa historia (nada más)
6. **Verificar** que cada criterio de aceptación esté cubierto en el código
7. **Mostrar el bloque de comandos** con los commits para que el usuario los ejecute

---

## Bloque de comandos — formato OBLIGATORIO al finalizar cada historia

Siempre termina la respuesta con este bloque (adaptando los valores).
La rama ya fue creada por Claude Code — el bloque empieza directo en los commits:

```
═══════════════════════════════════════════════════════════
📋 COMANDOS PARA EJECUTAR EN TU TERMINAL (VS Code)
   (La rama feature/... ya fue creada por Claude Code)
═══════════════════════════════════════════════════════════

# Commits por archivo (ejecutar en orden)
git add backend/src/main/java/com/gamelist/model/Models.java
git commit -m "feat: agregar entidad Videojuego con JPA - closes #1"

git add backend/src/main/java/com/gamelist/repository/Repositories.java
git commit -m "feat: agregar VideojuegoRepository con búsqueda parcial - closes #1"

git add backend/src/main/java/com/gamelist/controller/Controllers.java
git commit -m "feat: implementar CRUD completo /api/videojuegos - closes #1"

# 4. Subir la rama
git push origin feature/sprint1-backend-videojuegos

═══════════════════════════════════════════════════════════
📌 PR DESDE VS CODE (extensión GitHub Pull Requests):
   Base:    development
   Compare: feature/sprint1-backend-videojuegos
   Título:  [Sprint 1] feat: CRUD completo de videojuegos
   Body:    closes #1
═══════════════════════════════════════════════════════════
```

Los commits deben ser **granulares**: uno por archivo o grupo lógico.
Nunca un solo `git add .` para toda la historia.

---

## Stack técnico detallado

### Backend (Spring Boot)
- **Java 21**, Spring Boot 3.2.5
- **JPA/Hibernate** para persistencia
- **Bean Validation** (`@NotBlank`, `@Min`, `@Max`, etc.)
- **SpringDoc OpenAPI 2.5** para Swagger (NO springfox)
- **Fix HTTPS:** `server.forward-headers-strategy=framework` en application.properties
- **CORS:** configurado en `AppConfig.java` con `allowedOrigins("*")`

### Base de datos
- **PostgreSQL 15** en Cloud SQL
- Conexión via **Cloud SQL Socket Factory** (no TCP directo)
- 5 tablas: `categoria`, `plataforma`, `videojuego`, `resena`, `wishlist`
- Variables de entorno: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `INSTANCE_CONNECTION_NAME`

### Endpoints que debo implementar
```
/api/categorias                    → CRUD completo
/api/plataformas                   → CRUD completo
/api/videojuegos                   → CRUD + ?titulo= ?estado= ?categoriaId= ?plataformaId=
/api/videojuegos/{id}/categoria    → relación
/api/videojuegos/{id}/resenas      → relación
/api/videojuegos/estadisticas      → conteo por estado
/api/resenas                       → CRUD + GET por videojuego
/api/wishlist                      → CRUD + ?prioridad= ?titulo=
```

### Regla de búsqueda
- Usar `findByTituloContainingIgnoreCase()` en el repositorio
- Búsqueda parcial: buscar "wit" debe encontrar "The Witcher 3"

---

## Checklist antes de mostrar los comandos

Claude Code verifica mentalmente antes de dar los comandos:
- [ ] El código no tiene errores de sintaxis visibles
- [ ] Todos los criterios de aceptación de la historia están cubiertos
- [ ] Los commits incluyen `closes #N` con el número correcto
- [ ] Solo se modificaron archivos de esta historia
- [ ] No hay credenciales hardcodeadas

---

## Contexto de despliegue GCP

```yaml
Proyecto GCP:    game-list-cloud
Región:          us-central1
Servicio:        game-list-app (Cloud Run)
Instancia SQL:   game-list-cloud:us-central1:gamelist-db
Base de datos:   gamelist
Registry:        us-central1-docker.pkg.dev/game-list-cloud/...
```

El deploy automático ocurre al hacer merge a `main` via GitHub Actions → Cloud Build.
