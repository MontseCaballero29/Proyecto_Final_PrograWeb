package com.manosdeoaxaca.backend.repositorio;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.manosdeoaxaca.backend.model.Usuario;

public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

    boolean existsByCorreo(String correo);

    boolean existsByCorreoAndIdNot(String correo, Long id);

    List<Usuario> findByActivoTrueAndRolNombreOrderByNombreAsc(String rol);
}
