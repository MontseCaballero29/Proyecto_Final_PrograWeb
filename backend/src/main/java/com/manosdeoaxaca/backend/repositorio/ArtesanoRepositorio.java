package com.manosdeoaxaca.backend.repositorio;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.manosdeoaxaca.backend.model.Artesano;

public interface ArtesanoRepositorio extends JpaRepository<Artesano, Long> {

    Page<Artesano> findByComunidadId(Long comunidadId, Pageable pageable);

    Page<Artesano> findByEstadoValidacion(String estadoValidacion, Pageable pageable);

    boolean existsByUsuarioId(Long usuarioId);

    Optional<Artesano> findByUsuarioCorreo(String correo);

    @Query(
        value = """
            SELECT DISTINCT a
            FROM Artesano a
            JOIN a.usuario u
            JOIN a.comunidad c
            LEFT JOIN a.especialidades e
            WHERE (:comunidadId IS NULL OR c.id = :comunidadId)
              AND (:estado IS NULL OR UPPER(a.estadoValidacion) = UPPER(:estado))
              AND (:region IS NULL OR LOWER(c.region) = LOWER(:region))
              AND (
                :busqueda IS NULL
                OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                OR LOWER(u.correo) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                OR LOWER(e.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
              )
            """,
        countQuery = """
            SELECT COUNT(DISTINCT a.id)
            FROM Artesano a
            JOIN a.usuario u
            JOIN a.comunidad c
            LEFT JOIN a.especialidades e
            WHERE (:comunidadId IS NULL OR c.id = :comunidadId)
              AND (:estado IS NULL OR UPPER(a.estadoValidacion) = UPPER(:estado))
              AND (:region IS NULL OR LOWER(c.region) = LOWER(:region))
              AND (
                :busqueda IS NULL
                OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                OR LOWER(u.correo) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                OR LOWER(e.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
              )
            """)
    Page<Artesano> buscar(
            @Param("comunidadId") Long comunidadId,
            @Param("estado") String estado,
            @Param("busqueda") String busqueda,
            @Param("region") String region,
            Pageable pageable);
}
