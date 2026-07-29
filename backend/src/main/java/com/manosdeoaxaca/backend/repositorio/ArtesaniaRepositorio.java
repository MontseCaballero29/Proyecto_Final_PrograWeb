package com.manosdeoaxaca.backend.repositorio;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.manosdeoaxaca.backend.model.Artesania;

public interface ArtesaniaRepositorio extends JpaRepository<Artesania, Long> {

    @Query(
        value = """
            SELECT DISTINCT ar
            FROM Artesania ar
            JOIN ar.taller t
            JOIN t.comunidad c
            WHERE (:region IS NULL OR LOWER(c.region) = LOWER(:region))
              AND (
                :busqueda IS NULL
                OR LOWER(ar.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                OR LOWER(ar.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                OR LOWER(t.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
              )
            """,
        countQuery = """
            SELECT COUNT(DISTINCT ar.id)
            FROM Artesania ar
            JOIN ar.taller t
            JOIN t.comunidad c
            WHERE (:region IS NULL OR LOWER(c.region) = LOWER(:region))
              AND (
                :busqueda IS NULL
                OR LOWER(ar.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                OR LOWER(ar.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                OR LOWER(t.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
              )
            """)
    Page<Artesania> buscar(
            @Param("busqueda") String busqueda,
            @Param("region") String region,
            Pageable pageable);

    @Query("""
        SELECT DISTINCT ar
        FROM Artesania ar
        JOIN ar.taller t
        JOIN t.artesanos a
        WHERE LOWER(a.usuario.correo) = LOWER(:correo)
        """)
    Page<Artesania> buscarPorArtesano(
            @Param("correo") String correo,
            Pageable pageable);
}
