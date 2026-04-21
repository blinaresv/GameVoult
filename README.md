# Game List Cloud

### Sistema de Gestión de Videojuegos en la Nube

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

### Frontend: Firebase Hosting

Se utilizó Firebase Hosting para desplegar la interfaz web, aprovechando su CDN global para mejorar tiempos de carga y accesibilidad.

---

## 4. Arquitectura del Sistema

El sistema sigue una arquitectura de tres capas claramente definidas:

1. **Capa de presentación (Frontend)**
   Desarrollada en HTML, CSS y JavaScript. Se ejecuta en el navegador del usuario y se comunica con el backend mediante peticiones HTTP.

2. **Capa de lógica de negocio (Backend)**
   API REST desarrollada con Spring Boot, encargada de procesar solicitudes, validar datos y ejecutar la lógica del sistema.

3. **Capa de persistencia (Base de datos)**
   Base de datos PostgreSQL administrada en Cloud SQL, donde se almacena la información de los videojuegos.

### Flujo de comunicación:

```
Usuario → Navegador → Frontend → API REST → Base de datos → Respuesta JSON → Usuario
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

* **Cloud Run:** despliegue del backend en contenedores
* **Cloud SQL:** base de datos PostgreSQL administrada
* **Firebase Hosting:** publicación del frontend

Estos servicios permiten eliminar la necesidad de administrar infraestructura física, facilitando el desarrollo y despliegue.

---

## 7. URLs del Sistema

* Frontend:
  https://game-list-cloud-bcc6c.web.app

* Backend API:
  https://game-list-api-rjqftd4irq-uc.a.run.app

* Swagger:
  https://game-list-api-rjqftd4irq-uc.a.run.app/swagger-ui/index.html

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

### 7. Despliegue del Frontend

El frontend fue desplegado utilizando Firebase Hosting:

* Se inicializó el proyecto con `firebase init`
* Se configuró la carpeta pública (`frontend`)
* Se ejecutó el despliegue con:

```bash
firebase deploy
```

Firebase se encarga de distribuir el contenido mediante CDN, garantizando alta disponibilidad y tiempos de carga bajos.

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

### Problema: Conexión a base de datos

* Causa: bloqueo de IP en Cloud SQL
* Solución: habilitar acceso desde IP externa

### Problema: Error en Docker

* Causa: archivo `.jar` no encontrado
* Solución: corrección en Dockerfile

### Problema: CORS

* Causa: frontend y backend en dominios diferentes
* Solución: configuración global en Spring Boot

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
