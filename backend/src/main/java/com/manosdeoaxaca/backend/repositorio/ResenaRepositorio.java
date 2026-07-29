package com.manosdeoaxaca.backend.repositorio;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.manosdeoaxaca.backend.model.Resena;

public interface ResenaRepositorio extends JpaRepository<Resena, Long> {

    Page<Resena> findByUsuarioCorreo(String correo, Pageable pageable);

    Page<Resena> findByArtesanoId(Long artesanoId, Pageable pageable);

    Page<Resena> findByTallerId(Long tallerId, Pageable pageable);

    Page<Resena> findByArtesaniaId(Long artesaniaId, Pageable pageable);

    Optional<Resena> findByUsuarioCorreoAndArtesanoId(
            String correo,
            Long artesanoId);

    Optional<Resena> findByUsuarioCorreoAndTallerId(
            String correo,
            Long tallerId);

    Optional<Resena> findByUsuarioCorreoAndArtesaniaId(
            String correo,
            Long artesaniaId);
}
