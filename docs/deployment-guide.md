# Guía de Despliegue

## Game List Cloud

---

# 1. Introducción

Esta guía describe el proceso completo de despliegue de la aplicación **Game List Cloud** en Google Cloud Platform, incluyendo la configuración de la base de datos, el backend, el frontend y la integración continua mediante GitHub.

El objetivo es garantizar que cualquier persona pueda replicar el despliegue siguiendo estos pasos.

---

# 2. Arquitectura de Despliegue

El sistema se compone de tres servicios principales:

* **Frontend:** Firebase Hosting
* **Backend:** Cloud Run (contenedor Docker)
* **Base de datos:** Cloud SQL (PostgreSQL)

Flujo:

```
Usuario → Frontend → Backend → Base de datos
```

---

# 3. Configuración de Base de Datos (Cloud SQL)

---

## 3.1 Creación de instancia

1. Ingresar a Google Cloud Console
2. Ir a **Cloud SQL**
3. Crear nueva instancia PostgreSQL
4. Configurar:

   * Nombre: gamelist-db
   * Versión: PostgreSQL
   * Región: us-central1

---

## 3.2 Configuración de acceso

* Habilitar **IP pública**
* Autorizar red (0.0.0.0/0 para pruebas o IP específica)
* Crear usuario:

  * usuario: postgres
  * contraseña: configurada

---

## 3.3 Creación de base de datos

* Nombre: gamelist

---

## 3.4 Creación de tablas

Se ejecutaron scripts SQL:

```sql
CREATE TABLE categoria (...);
CREATE TABLE videojuego (...);
```

---

# 4. Configuración del Backend

---

## 4.1 Archivo application.properties

Se configuró la conexión:

```properties
spring.datasource.url=jdbc:postgresql://IP:5432/gamelist
spring.datasource.username=postgres
spring.datasource.password=******
```

---

## 4.2 Validación local

Antes del despliegue:

```bash
mvn spring-boot:run
```

Se verificó conexión a la base de datos y funcionamiento de endpoints.

---

# 5. Contenerización con Docker

---

## 5.1 Creación del Dockerfile

Se creó un archivo Dockerfile con múltiples etapas:

* Etapa 1: construcción con Maven
* Etapa 2: ejecución con Java

Este proceso permite:

* Generar el archivo `.jar`
* Ejecutarlo dentro del contenedor

---

## 5.2 Función del Dockerfile

El Dockerfile:

* Define el entorno de ejecución
* Compila el proyecto
* Expone el puerto 8080
* Ejecuta la aplicación

Esto garantiza portabilidad y consistencia entre entornos.

---

# 6. Integración Continua (CI/CD)

---

## 6.1 Conexión con GitHub

Se utilizó **Developer Connect** para enlazar el repositorio:

* Se conectó GitHub con Google Cloud
* Se seleccionó la rama `main`

---

## 6.2 Archivo de build (cloudbuild.yaml)

Durante el despliegue, Google Cloud genera un archivo interno equivalente a:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'imagen', '.']
```

Este archivo define:

* Construcción del contenedor
* Publicación en Artifact Registry
* Despliegue en Cloud Run

---

## 6.3 Activador (Trigger)

Se configuró un trigger automático que:

* Detecta cambios en GitHub
* Ejecuta el build automáticamente
* Despliega la nueva versión

Esto implementa un flujo de integración continua.

---

# 7. Despliegue en Cloud Run

---

## 7.1 Creación del servicio

1. Ir a Cloud Run
2. Crear servicio
3. Seleccionar repositorio conectado

---

## 7.2 Configuración

* Puerto: 8080
* Acceso: público
* Región: us-central1
* Escalado automático habilitado

---

## 7.3 Proceso de despliegue

Cloud Run ejecuta:

1. Clona el repositorio
2. Ejecuta Cloud Build
3. Construye la imagen Docker
4. Despliega el contenedor

---

## 7.4 Resultado

Se obtiene una URL pública:

```bash
https://game-list-api-rjqftd4irq-uc.a.run.app
```

---

# 8. Despliegue del Frontend (Firebase)

---

## 8.1 Inicialización

```bash
firebase init
```

---

## 8.2 Configuración

* Carpeta pública: frontend
* Hosting habilitado

---

## 8.3 Despliegue

```bash
firebase deploy
```

---

## 8.4 Resultado

```bash
https://game-list-cloud-bcc6c.web.app
```

---

# 9. Integración Frontend – Backend

Se configuró el frontend para consumir la API:

```javascript
const API_URL = "https://game-list-api-rjqftd4irq-uc.a.run.app";
```

Esto permite que las peticiones HTTP se realicen al backend desplegado.

---

# 10. Problemas Encontrados

---

## Problema 1: Error en Docker

* Causa: archivo `.jar` no encontrado
* Solución: uso de build con Maven en Docker

---

## Problema 2: Conexión a Cloud SQL

* Causa: IP bloqueada
* Solución: habilitar acceso

---

## Problema 3: CORS

* Causa: frontend y backend en dominios distintos
* Solución: configuración en Spring Boot

---

## Problema 4: Conflictos en Git

* Causa: archivos `.DS_Store`
* Solución: uso de `.gitignore`

---

# 11. Validación del Sistema

Se realizaron pruebas mediante:

* Swagger
* Postman
* Frontend

Se verificó:

* CRUD completo
* Conexión con base de datos
* Persistencia de datos

---

# 12. URLs Finales

Frontend:
https://game-list-cloud-bcc6c.web.app

Backend:
https://game-list-api-rjqftd4irq-uc.a.run.app

Swagger:
https://game-list-api-rjqftd4irq-uc.a.run.app/swagger-ui/index.html

---

# 13. Conclusión

El despliegue del sistema demuestra la implementación de una arquitectura moderna basada en servicios cloud, logrando automatización, escalabilidad y disponibilidad.

Se integraron correctamente herramientas de desarrollo, contenedorización y despliegue continuo, garantizando un sistema funcional en producción.

---
