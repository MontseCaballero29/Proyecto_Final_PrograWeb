CREATE TABLE artesano_taller (
    taller_id BIGINT NOT NULL,
    artesano_id BIGINT NOT NULL,

    PRIMARY KEY (taller_id, artesano_id),

    CONSTRAINT fk_artesano_taller_taller
        FOREIGN KEY (taller_id)
        REFERENCES taller(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_artesano_taller_artesano
        FOREIGN KEY (artesano_id)
        REFERENCES artesano(id)
        ON DELETE CASCADE
);