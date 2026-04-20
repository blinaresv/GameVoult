# ============================================================
# Dockerfile UNIFICADO — Backend + Frontend en un solo contenedor
# El backend Spring Boot sirve el frontend como recursos estáticos
# ============================================================

# ── Etapa 1: Build del backend con Maven ────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copiar pom.xml primero (cache de dependencias)
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código fuente del backend
COPY backend/src ./src

# Copiar frontend dentro de los recursos estáticos de Spring Boot
# Esto hace que Spring Boot sirva el frontend en la raíz /
COPY frontend/ ./src/main/resources/static/

# Compilar
RUN mvn clean package -DskipTests

# ── Etapa 2: Imagen final liviana ───────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiar el jar compilado
COPY --from=build /app/target/*.jar app.jar

# Puerto que expone la app
EXPOSE 8080

# Variables de entorno (se sobreescriben en Cloud Run)
ENV DB_NAME=gamelist
ENV DB_USER=postgres
ENV DB_PASSWORD=changeme
ENV INSTANCE_CONNECTION_NAME=project:region:instance

# Arrancar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
