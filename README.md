# Manos de Oaxaca

## Sistema de gestión de artesanos, talleres y artesanías

Plataforma web de back-office para el **Instituto Oaxaqueño de las Artesanías (ARIPO)**.

## Integrantes:

- Dalia Montserrat Caballero Silva — [MontseCaballero29](https://github.com/MontseCaballero29)
- Melissa Gandarillas — [MeliGandarillas](https://github.com/MeliGandarillas)

Proyecto final — Programación Web · Instituto Tecnológico de Oaxaca (ITO)

---

## Descripción del proyecto

**Manos de Oaxaca** es un sistema web diseñado para registrar, organizar, administrar y consultar información relacionada con los artesanos, talleres y artesanías del estado de Oaxaca.

El sistema concentra en un solo lugar la información de los artesanos, sus especialidades, los talleres en los que colaboran y las artesanías que elaboran.

## Problemática que resuelve

En Oaxaca existe una gran diversidad de artesanos y talleres dedicados a la elaboración de productos tradicionales. Sin embargo, la información sobre ellos suele encontrarse dispersa, incompleta o desactualizada. Esto dificulta conocer quiénes son los artesanos, qué especialidades tienen, en qué talleres trabajan, dónde se encuentran esos talleres y qué artesanías producen.

Manos de Oaxaca resuelve esta problemática mediante una plataforma que administra y consulta esta información de forma organizada, accesible y centralizada.

---

## Tecnologías utilizadas

**Backend**
- Java + Spring Boot 4
- Spring Security + JWT (autenticación sin estado)
- Contraseñas cifradas con BCrypt
- Spring Data JPA / Hibernate
- MySQL 8
- Flyway (migraciones versionadas)
- Bean Validation

**Frontend**
- React + Vite
- React Router DOM (ruteo y rutas protegidas)
- Fetch API (con token JWT en el header)

**Otros**
- Bruno (pruebas de la API)
- Figma (diseño de interfaz)
- Twilio (notificaciones por SMS y WhatsApp)
- Nginx y AWS EC2 (despliegue en VPS)

---

## Diagrama Entidad-Relación

```mermaid
erDiagram
  ROL ||--o{ USUARIO : tiene
  USUARIO ||--o| ARTESANO : es
  COMUNIDAD ||--o{ ARTESANO : ubica
  COMUNIDAD ||--o{ TALLER : ubica
  ARTESANO ||--o{ ARTESANO_ESPECIALIDAD : posee
  ESPECIALIDAD ||--o{ ARTESANO_ESPECIALIDAD : clasifica
  ARTESANO ||--o{ ARTESANO_TALLER : colabora
  TALLER ||--o{ ARTESANO_TALLER : integra
  TALLER ||--o{ ARTESANIA : produce
  USUARIO ||--o{ ARTESANO : valida

  ROL {
    bigint id PK
    varchar nombre UK
    varchar descripcion
  }
  USUARIO {
    bigint id PK
    varchar nombre
    varchar correo UK
    varchar password_hash
    varchar telefono
    varchar avatar_url
    boolean activo
    bigint rol_id FK
    timestamp creado_en
  }
  ARTESANO {
    bigint id PK
    bigint usuario_id FK "UK"
    bigint comunidad_id FK
    varchar curp
    text biografia
    int anios_oficio
    varchar lengua
    varchar estado_validacion
    bigint validado_por FK
    timestamp validado_en
  }
  ESPECIALIDAD {
    bigint id PK
    varchar nombre UK
    varchar descripcion
  }
  COMUNIDAD {
    bigint id PK
    varchar nombre
    varchar region
    decimal latitud
    decimal longitud
  }
  ARTESANO_ESPECIALIDAD {
    bigint artesano_id PK "FK"
    bigint especialidad_id PK "FK"
  }
  TALLER {
    bigint id PK
    varchar nombre
    text descripcion
    varchar direccion
    varchar municipio
    bigint comunidad_id FK
  }
  ARTESANO_TALLER {
    bigint taller_id PK "FK"
    bigint artesano_id PK "FK"
  }
  ARTESANIA {
    bigint id PK
    varchar nombre
    text descripcion
    decimal precio
    int existencia
    varchar imagen_url
    bigint taller_id FK
  }
```

### Relaciones principales

- Un **rol** puede estar asignado a varios **usuarios**.
- Un **usuario** puede tener un perfil de **artesano** (relación 1:1).
- Una **comunidad** ubica a varios **artesanos** y varios **talleres**.
- Un **artesano** puede dominar varias **especialidades**, y una especialidad la comparten varios artesanos (**relación muchos a muchos** vía `artesano_especialidad`).
- Un **artesano** puede colaborar en varios **talleres**, y un taller integra varios artesanos (**relación muchos a muchos** vía `artesano_taller`).
- Un **taller** puede producir varias **artesanías**.
- Un **usuario** administrador puede validar a varios **artesanos** (campo `validado_por`).

---

## API REST

URL base local: `http://localhost:8090`

URL base pública: `https://talleresartesaniasoaxaca.dpdns.org/api`

Todas las rutas fuera de `/api/auth/**` requieren el encabezado `Authorization: Bearer <token>`.

### Autenticación — `/api/auth` (público)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registra un visitante con nombre, correo, contraseña y teléfono. Devuelve token JWT, correo y rol. |
| POST | `/api/auth/login` | Valida credenciales (BCrypt). Devuelve token JWT, correo y rol. |

### Artesanos — `/api/artesanos`

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/api/artesanos` | Autenticado | Listado con paginación y filtros (`comunidadId`, `estadoValidacion`, `page`, `size`). |
| GET | `/api/artesanos/{id}` | Autenticado | Obtiene un artesano por id. |
| GET | `/api/artesanos/{id}/edicion` | ADMIN | Obtiene todos los datos necesarios para revisar o editar un artesano. |
| POST | `/api/artesanos` | ADMIN | Crea un artesano. |
| PATCH | `/api/artesanos/{id}/aprobar` | ADMIN | Cambia el estado a `APROBADO`, registra al administrador que validó y solicita el envío de WhatsApp. |
| PATCH | `/api/artesanos/{id}/rechazar` | ADMIN | Cambia el estado de la solicitud a `RECHAZADO`. |
| PUT | `/api/artesanos/{id}` | ADMIN | Actualiza un artesano. |
| DELETE | `/api/artesanos/{id}` | ADMIN | Elimina un artesano. |

---

## Validación de artesanos y notificaciones

El sistema utiliza tres estados de validación para los perfiles de artesanos:

- `EN_REVISION`: perfil registrado y pendiente de decisión.
- `APROBADO`: perfil aceptado por un administrador.
- `RECHAZADO`: solicitud rechazada por un administrador.

### Flujo

1. El visitante se registra con un número telefónico en formato internacional, por ejemplo: `+529511234567`.
2. Cuando el administrador crea su perfil de artesano, el sistema lo guarda como `EN_REVISION` y solicita el envío de un **SMS** de confirmación.
3. El administrador ingresa a **Solicitudes de registro**.
4. En cada fila puede usar **Revisar**, **Aprobar** o **Rechazar**.
5. Si selecciona **Aprobar**, el perfil cambia a `APROBADO` y se solicita el envío del mensaje por **WhatsApp**.
6. Si selecciona **Rechazar**, el perfil cambia a `RECHAZADO` y desaparece del listado de solicitudes pendientes.

En cuentas de prueba de Twilio, el número receptor debe estar autorizado. Para WhatsApp Sandbox, el receptor debe haberse unido previamente enviando el código `join` indicado por Twilio.

### Talleres — `/api/talleres`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/talleres` | Lista todos los talleres. |
| GET | `/api/talleres/{id}` | Obtiene un taller por id. |
| POST | `/api/talleres` | Crea un taller. |
| PUT | `/api/talleres/{id}` | Actualiza un taller. |
| DELETE | `/api/talleres/{id}` | Elimina un taller. |

### Artesanías — `/api/artesanias`

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/api/artesanias` | Autenticado | Lista todas las artesanías. |
| GET | `/api/artesanias/{id}` | Autenticado | Obtiene una artesanía por id. |
| POST | `/api/artesanias` | ADMIN | Crea una artesanía. |
| PUT | `/api/artesanias/{id}` | ADMIN | Actualiza una artesanía. |
| DELETE | `/api/artesanias/{id}` | ADMIN | Elimina una artesanía. |

---

## Roles de usuario

### Administrador
Acceso total: gestión de usuarios, roles, artesanos, talleres, especialidades y artesanías.

### Artesano
Consulta y actualiza su perfil, y administra sus talleres y artesanías. Los artesanos pasan por un proceso de validación por parte de ARIPO antes de ser aprobados.

### Visitante
Consulta artesanos, talleres y artesanías, y utiliza búsquedas y filtros. No puede modificar información. Es el rol que se asigna al registrarse de forma pública.

---

## Credenciales de prueba

Usuarios ya cargados en los datos de prueba, uno por cada rol:

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | `admin@aripo.gob.mx` | `Admin123!` |
| Artesano | `artesano@aripo.gob.mx` | `Artesano123!` |
| Visitante | `cliente@gmail.com` | `Cliente123!` |

El usuario administrador permite ingresar y evaluar todos los módulos del sistema.

---

## Instrucciones de instalación

### Requisitos previos
- Java 21 o superior y Maven
- MySQL 8 en ejecución, con la base `manos_oaxaca_final` creada
- Node.js y npm

### Configuración

Copia `application.properties.example` a `application.properties` dentro de `backend/src/main/resources/` y completa los valores (credenciales de MySQL, clave secreta del JWT). Este archivo no se sube al repositorio por seguridad.

Para activar las notificaciones en el VPS, el servicio utiliza variables de entorno. Ejemplo sin credenciales reales:

```env
TWILIO_ENABLED=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_SMS_FROM=+10000000000
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

Después de modificar las variables del VPS se debe reiniciar el servicio:

```bash
sudo systemctl restart manos-oaxaca.service
sudo systemctl is-active manos-oaxaca.service
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

En Windows (PowerShell): `.\mvnw.cmd spring-boot:run`

El servidor arranca en `http://localhost:8090`. Flyway aplica las migraciones automáticamente.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

---

## Base de datos

- Motor: **MySQL 8**.
- Las tablas se crean y versionan mediante **migraciones de Flyway** (`backend/src/main/resources/db/migration/`), no manualmente ni por generación automática de JPA (`ddl-auto=validate`).
- Datos de prueba cargados mediante migraciones de seed.
- Relación muchos a muchos entre `artesano` y `especialidad` (y también entre `artesano` y `taller`).

---

## Seguridad

- Contraseñas almacenadas con **BCrypt**.
- Autenticación **JWT**; sesión sin estado.
- Autorización por rol con `@PreAuthorize`.
- Manejo global de errores con `@RestControllerAdvice` (respuestas JSON con códigos HTTP 400, 401, 403, 404, 500).
- Validaciones con Bean Validation en el backend y validaciones visibles bajo cada campo en el frontend.
- Variables sensibles fuera del repositorio; se incluye `application.properties.example`.

---

## Pruebas de la API

Las pruebas de los endpoints están documentadas en una colección de **Bruno**, versionada dentro del repositorio. Incluye login y obtención del token JWT, uso del token en peticiones protegidas, y casos de error (acceso denegado y recurso no encontrado).

---

## Organización del proyecto

El desarrollo se administra mediante GitHub Projects con las columnas: Backlog, To Do, In Progress, In Review y Done.

### Repositorio de GitHub
https://github.com/MontseCaballero29/Proyecto_Final_PrograWeb

### GitHub Projects
https://github.com/users/MontseCaballero29/projects/1

### Prototipo de Figma
*https://www.figma.com/proto/CbaXPifFINz2uZvt2uEyDT/Proyecto_Final_Equipo2?node-id=2019-13&t=b3MalXEKAQhqGxqS-1*

### Proyecto desplegado (VPS)
[https://talleresartesaniasoaxaca.dpdns.org/](https://talleresartesaniasoaxaca.dpdns.org/)

El backend se ejecuta internamente en el puerto `8090`. Nginx funciona como proxy inverso y permite acceder públicamente mediante el dominio HTTPS, por lo que no es necesario escribir el puerto en la URL pública.

### URL base pública de la API
[https://talleresartesaniasoaxaca.dpdns.org/api](https://talleresartesaniasoaxaca.dpdns.org/api)

---

## Estado actual

Proyecto desplegado en VPS con frontend React servido mediante Nginx y backend Spring Boot ejecutándose en el puerto interno `8090`. Incluye autenticación JWT, control de permisos por rol, CRUD de artesanos, talleres, artesanías y especialidades, filtros, paginación, reseñas, configuración de cuenta, validación de solicitudes de artesanos y notificaciones mediante SMS y WhatsApp con Twilio.
