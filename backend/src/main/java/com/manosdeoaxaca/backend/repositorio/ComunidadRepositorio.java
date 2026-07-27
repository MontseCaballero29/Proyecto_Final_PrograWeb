package com.manosdeoaxaca.backend.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;

import com.manosdeoaxaca.backend.model.Comunidad;

public interface ComunidadRepositorio extends JpaRepository<Comunidad, Long> {
}