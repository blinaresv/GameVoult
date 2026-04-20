# Guía de configuración — GitHub Projects (Kanban)

## Tablero: GameVault_list

### Columnas requeridas
| Columna | Descripción |
|---|---|
| Backlog | Historia pendiente de iniciar |
| Ready | Lista para ser tomada |
| In Progress | En desarrollo activo |
| Review | PR abierto, esperando revisión |
| Done | Completada y mergeada |

---

### Campos personalizados

Ve a tu proyecto → **⚙️ Settings** → **Custom fields** → agregar cada campo:

| Campo | Tipo | Opciones |
|---|---|---|
| Sprint | Single select | Sprint 1, Sprint 2, Sprint 3 |
| Prioridad | Single select | Alta, Media, Baja |
| Estimación | Single select | 1, 2, 3, 5, 8 |
| Tipo | Single select | Feature, Bug, Documentation, DevOps |

---

### Historias de usuario y sus valores

| Issue | Historia | Sprint | Responsable | Prioridad | Estimación | Tipo |
|---|---|---|---|---|---|---|
| HU-01 | Gestión de videojuegos | Sprint 1 | Persona 1 | Alta | 5 | Feature |
| HU-02 | Clasificación por categorías | Sprint 1 | Persona 1 | Alta | 3 | Feature |
| HU-03 | Gestión de plataformas | Sprint 1 | Persona 1 | Alta | 3 | Feature |
| HU-04 | Búsqueda y filtros API | Sprint 1 | Persona 1 | Media | 3 | Feature |
| HU-05 | Cloud SQL setup | Sprint 1 | Persona 1 | Alta | 5 | DevOps |
| HU-06 | Reseñas | Sprint 1 | Persona 1 | Media | 3 | Feature |
| HU-18 | Wishlist API | Sprint 1 | Persona 1 | Media | 3 | Feature |
| HU-07 | Biblioteca visual | Sprint 2 | Persona 2 | Alta | 5 | Feature |
| HU-08 | Búsqueda frontend | Sprint 2 | Persona 2 | Alta | 3 | Feature |
| HU-09 | Detalle videojuego | Sprint 2 | Persona 2 | Alta | 5 | Feature |
| HU-10 | Formulario agregar/editar | Sprint 2 | Persona 2 | Alta | 3 | Feature |
| HU-11 | Wishlist frontend | Sprint 2 | Persona 2 | Media | 3 | Feature |
| HU-12 | Estadísticas dashboard | Sprint 2 | Persona 2 | Media | 2 | Feature |
| HU-13 | Docker unificado | Sprint 3 | Persona 2 | Alta | 5 | DevOps |
| HU-14 | CI/CD Cloud Build | Sprint 3 | Persona 1 | Alta | 5 | DevOps |
| HU-15 | Configuración Kanban | Sprint 3 | Persona 2 | Alta | 2 | Documentation |
| HU-16 | Documentación completa | Sprint 3 | Persona 2 | Alta | 3 | Documentation |
| HU-17 | Swagger HTTPS + errores | Sprint 3 | Persona 1 | Alta | 3 | Bug |

---

### Automatización del Kanban

El workflow `.github/workflows/kanban-automation.yml` mueve las cards automáticamente
para issues y PRs **creados después** de que el workflow esté activo:

| Evento | Movimiento |
|---|---|
| Issue abierto | → Ready |
| Issue asignado | → In Progress |
| PR abierto con `closes #N` | → Review |
| PR mergeado con `closes #N` | → Done |

> **Importante:** en el body del PR siempre usar `closes #N` donde `N`
> es el número real del issue en GitHub (visible en la pestaña Issues).
