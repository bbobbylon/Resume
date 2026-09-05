# ---- Build stage -----------------------------------------------------------
# A Maven+JDK image is only needed to compile and package the app; this whole
# stage is discarded afterward — only the jar it produces makes it into the
# final image below.
FROM maven:3-eclipse-temurin-26 AS build
WORKDIR /app

# Copying just the pom first (before the source) means Docker can cache the
# dependency-download layer: as long as pom.xml hasn't changed, editing Java
# source later won't re-trigger a full re-download.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B package -DskipTests

# ---- Run stage --------------------------------------------------------------
# A slim JRE (not a full JDK) is enough to *run* a packaged jar, and keeps the
# final image small — per team convention (multi-stage build, slim JRE).
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/websitehub-backend-*.jar app.jar

# Documentation only — Render (and most hosts) inject the real PORT at runtime
# and route to it regardless of what's EXPOSEd here.
EXPOSE 8420

ENTRYPOINT ["java", "-jar", "app.jar"]
