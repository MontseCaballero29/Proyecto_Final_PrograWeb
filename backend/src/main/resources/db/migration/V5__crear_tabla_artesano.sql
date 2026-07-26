CREATE TABLE artesano (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT NOT NULL UNIQUE,
  comunidad_id BIGINT NOT NULL,
  curp VARCHAR(18),
  biografia TEXT,
  anios_oficio INT,
  lengua VARCHAR(80),
  estado_validacion VARCHAR(20) NOT NULL DEFAULT 'EN_REVISION',
  validado_por BIGINT,
  validado_en TIMESTAMP NULL,
  CONSTRAINT fk_art_usuario FOREIGN KEY (usuario_id)   REFERENCES usuario(id),
  CONSTRAINT fk_art_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id),
  CONSTRAINT fk_art_validador FOREIGN KEY (validado_por) REFERENCES usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;