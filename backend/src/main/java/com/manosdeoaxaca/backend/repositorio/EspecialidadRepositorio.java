package com.manosdeoaxaca.backend.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;

import com.manosdeoaxaca.backend.model.Especialidad;

public interface EspecialidadRepositorio extends JpaRepository<Especialidad, Long> {
}