package com.manosdeoaxaca.backend.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;

import com.manosdeoaxaca.backend.model.Artesania;

public interface ArtesaniaRepositorio extends JpaRepository<Artesania, Long> {
}