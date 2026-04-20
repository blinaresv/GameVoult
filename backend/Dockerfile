FROM eclipse-temurin:21-jdk
WORKDIR /app
# Copiamos el jar generado por Maven
COPY target/*.jar app.jar
# Exponemos el puerto 8080 (estándar de Cloud Run)
EXPOSE 8080
# Comando de arranque pasando el puerto como propiedad de sistema
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]