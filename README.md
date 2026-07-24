# Manos de Oaxaca

## Sistema de gestión de artesanos, talleres y artesanías

## Integrantes del equipo

- Dalia Montserrat Caballero Silva — [MontseCaballero29](https://github.com/MontseCaballero29)
- Melissa Gandarillas — [MeliGandarillas](https://github.com/MeliGandarillas)

## Descripción del proyecto

**Manos de Oaxaca** es un sistema web diseñado para registrar, organizar, administrar y consultar información relacionada con los artesanos, talleres y artesanías del estado de Oaxaca.

El sistema permitirá concentrar en un solo lugar la información de los artesanos, sus especialidades, los talleres en los que colaboran y las artesanías que elaboran.

## Problemática que resuelve

En Oaxaca existe una gran diversidad de artesanos y talleres dedicados a la elaboración de productos tradicionales. Sin embargo, la información sobre ellos suele encontrarse dispersa, incompleta o desactualizada.

Esto dificulta conocer:

- Quiénes son los artesanos.
- Qué especialidades tienen.
- En qué talleres trabajan.
- Dónde se encuentran los talleres.
- Qué artesanías producen.

Manos de Oaxaca busca resolver esta problemática mediante una plataforma que permita administrar y consultar esta información de forma organizada, accesible y centralizada.

## Módulos principales

### 1. Gestión de usuarios y roles

Permitirá registrar usuarios, iniciar sesión y controlar los permisos de acceso de acuerdo con el rol asignado.

### 2. Gestión de artesanos

Permitirá registrar, consultar, actualizar y eliminar la información de los artesanos, incluyendo sus datos personales, biografía y especialidad.

### 3. Gestión de talleres

Permitirá registrar y administrar los talleres artesanales, incluyendo su nombre, descripción, dirección, comunidad y municipio.

### 4. Gestión de especialidades

Permitirá administrar las diferentes especialidades artesanales, como:

- Barro negro.
- Alebrijes.
- Textiles.
- Talabartería.
- Tallado en madera.
- Joyería artesanal.

### 5. Gestión de artesanías

Permitirá registrar y administrar las artesanías elaboradas, incluyendo nombre, descripción, precio, existencia, imagen, especialidad y taller de procedencia.

### 6. Consulta y búsqueda

Permitirá buscar y filtrar artesanos, talleres y artesanías por nombre, especialidad, comunidad o municipio.

## Entidades o tablas principales

El sistema tendrá las siguientes entidades relacionadas:

- Rol.
- Usuario.
- Artesano.
- Taller.
- Especialidad.
- Artesanía.
- Artesano-Taller.

## Relaciones principales

- Un rol puede estar asignado a varios usuarios.
- Un usuario puede tener un perfil de artesano.
- Un artesano puede pertenecer a una especialidad.
- Un artesano puede colaborar en uno o varios talleres.
- Un taller puede tener varios artesanos.
- Un taller puede registrar varias artesanías.
- Una especialidad puede estar relacionada con varios artesanos y artesanías.

## Roles de usuario

### Administrador

Podrá administrar:

- Usuarios.
- Roles.
- Artesanos.
- Talleres.
- Especialidades.
- Artesanías.

### Artesano o encargado de taller

Podrá:

- Consultar y actualizar su perfil.
- Registrar y administrar sus talleres.
- Registrar y administrar sus artesanías.

### Visitante

Podrá:

- Consultar artesanos.
- Consultar talleres.
- Consultar artesanías.
- Utilizar búsquedas y filtros.

El visitante no podrá modificar la información del sistema.

## Organización del proyecto

El desarrollo se administrará mediante GitHub Projects utilizando las siguientes columnas:

- Backlog.
- To Do.
- In Progress.
- In Review.
- Done.

Cada integrante tendrá al menos 10 tareas asignadas dentro del Backlog.

## Enlaces

### Repositorio de GitHub

https://github.com/MontseCaballero29/Proyecto_Final_PrograWeb

### GitHub Projects

https://github.com/users/MontseCaballero29/projects/1

## Estado actual

El proyecto se encuentra en la etapa de análisis, diseño de la base de datos y planificación de módulos y funcionalidades.
