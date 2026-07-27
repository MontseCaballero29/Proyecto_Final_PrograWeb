CREATE TABLE artesania (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    existencia INT NOT NULL DEFAULT 0,
    imagen_url VARCHAR(255),
    taller_id BIGINT NOT NULL,

    CONSTRAINT fk_artesania_taller
        FOREIGN KEY (taller_id)
        REFERENCES taller(id)
);