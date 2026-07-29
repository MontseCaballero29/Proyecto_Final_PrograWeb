package com.manosdeoaxaca.backend.repositorio;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.manosdeoaxaca.backend.model.Artesano;

public interface ArtesanoRepositorio extends JpaRepository<Artesano, Long> {

    Page<Artesano> findByComunidadId(Long comunidadId, Pageable pageable);

    Page<Artesano> findByEstadoValidacion(String estadoValidacion, Pageable pageable);

    boolean existsByUsuarioId(Long usuarioId);
}
