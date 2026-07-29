CREATE TABLE resena (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    artesano_id BIGINT NULL,
    taller_id BIGINT NULL,
    artesania_id BIGINT NULL,
    calificacion INT NOT NULL,
    comentario VARCHAR(1000) NOT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_resena_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_resena_artesano
        FOREIGN KEY (artesano_id) REFERENCES artesano (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_resena_taller
        FOREIGN KEY (taller_id) REFERENCES taller (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_resena_artesania
        FOREIGN KEY (artesania_id) REFERENCES artesania (id)
        ON DELETE CASCADE,
    CONSTRAINT uk_resena_usuario_artesano
        UNIQUE (usuario_id, artesano_id),
    CONSTRAINT uk_resena_usuario_taller
        UNIQUE (usuario_id, taller_id),
    CONSTRAINT uk_resena_usuario_artesania
        UNIQUE (usuario_id, artesania_id),
    CONSTRAINT chk_resena_calificacion
        CHECK (calificacion BETWEEN 1 AND 5),
    CONSTRAINT chk_resena_recurso
        CHECK (
            (artesano_id IS NOT NULL)
            + (taller_id IS NOT NULL)
            + (artesania_id IS NOT NULL) = 1
        )
);

CREATE INDEX idx_resena_creado_en
    ON resena (creado_en);
