package com.manosdeoaxaca.backend.repositorio;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.manosdeoaxaca.backend.model.Taller;

public interface TallerRepositorio extends JpaRepository<Taller, Long> {

    Page<Taller> findByMunicipioContainingIgnoreCase(
            String municipio,
            Pageable pageable);

    @Query("""
        SELECT DISTINCT t
        FROM Taller t
        JOIN t.comunidad c
        LEFT JOIN t.artesanos a
        LEFT JOIN a.usuario u
        LEFT JOIN a.especialidades e
        WHERE (
            :municipio IS NULL
            OR LOWER(t.municipio) LIKE LOWER(CONCAT('%', :municipio, '%'))
          )
          AND (:region IS NULL OR LOWER(c.region) = LOWER(:region))
          AND (
            :busqueda IS NULL
            OR LOWER(t.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
            OR LOWER(t.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%'))
            OR LOWER(t.direccion) LIKE LOWER(CONCAT('%', :busqueda, '%'))
            OR LOWER(t.municipio) LIKE LOWER(CONCAT('%', :busqueda, '%'))
            OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
            OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
            OR LOWER(e.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
          )
        """)
    Page<Taller> buscar(
            @Param("municipio") String municipio,
            @Param("busqueda") String busqueda,
            @Param("region") String region,
            Pageable pageable);

    @Query("""
        SELECT DISTINCT t
        FROM Taller t
        JOIN t.artesanos a
        WHERE LOWER(a.usuario.correo) = LOWER(:correo)
        """)
    Page<Taller> buscarPorArtesano(
            @Param("correo") String correo,
            Pageable pageable);
}
