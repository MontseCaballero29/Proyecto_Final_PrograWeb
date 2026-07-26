CREATE TABLE artesano_especialidad (
  artesano_id BIGINT NOT NULL,
  especialidad_id BIGINT NOT NULL,
  PRIMARY KEY (artesano_id, especialidad_id),
  CONSTRAINT fk_ae_artesano FOREIGN KEY (artesano_id) REFERENCES artesano(id) ON DELETE CASCADE,
  CONSTRAINT fk_ae_especialidad FOREIGN KEY (especialidad_id) REFERENCES especialidad(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;