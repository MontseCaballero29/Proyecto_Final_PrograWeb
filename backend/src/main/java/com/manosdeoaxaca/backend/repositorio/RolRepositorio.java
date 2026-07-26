package com.manosdeoaxaca.backend.repositorio;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.manosdeoaxaca.backend.model.Rol;

public interface RolRepositorio extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombre(String nombre);
}