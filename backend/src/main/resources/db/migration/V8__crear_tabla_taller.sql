CREATE TABLE taller (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    direccion VARCHAR(200) NOT NULL,
    municipio VARCHAR(120) NOT NULL,
    comunidad_id BIGINT NOT NULL,

    CONSTRAINT fk_taller_comunidad
        FOREIGN KEY (comunidad_id)
        REFERENCES comunidad(id)
);