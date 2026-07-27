package com.manosdeoaxaca.backend.servicio;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.manosdeoaxaca.backend.dto.AuthResponse;
import com.manosdeoaxaca.backend.dto.LoginRequest;
import com.manosdeoaxaca.backend.dto.RegistroRequest;
import com.manosdeoaxaca.backend.model.Rol;
import com.manosdeoaxaca.backend.model.Usuario;
import com.manosdeoaxaca.backend.repositorio.RolRepositorio;
import com.manosdeoaxaca.backend.repositorio.UsuarioRepositorio;
import com.manosdeoaxaca.backend.seguridad.JwtServicio;

@Service
public class AuthServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final RolRepositorio rolRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final JwtServicio jwtServicio;
    private final AuthenticationManager authenticationManager;

    public AuthServicio(UsuarioRepositorio usuarioRepositorio, RolRepositorio rolRepositorio,
            PasswordEncoder passwordEncoder, JwtServicio jwtServicio,
            AuthenticationManager authenticationManager) {
        this.usuarioRepositorio = usuarioRepositorio;
        this.rolRepositorio = rolRepositorio;
        this.passwordEncoder = passwordEncoder;
        this.jwtServicio = jwtServicio;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse registrar(RegistroRequest peticion) {
        if (usuarioRepositorio.existsByCorreo(peticion.getCorreo())) {
            throw new RuntimeException("Ya existe un usuario con ese correo");
        }

        Rol rolVisitante = rolRepositorio.findByNombre("VISITANTE")
                .orElseThrow(() -> new RuntimeException("El rol VISITANTE no existe"));

        Usuario usuario = new Usuario();
        usuario.setNombre(peticion.getNombre());
        usuario.setCorreo(peticion.getCorreo());
        usuario.setPasswordHash(passwordEncoder.encode(peticion.getPassword()));
        usuario.setRol(rolVisitante);

        usuarioRepositorio.save(usuario);

        String token = jwtServicio.generarToken(usuario.getCorreo(), rolVisitante.getNombre());
        return new AuthResponse(token, usuario.getCorreo(), rolVisitante.getNombre());
    }

    public AuthResponse login(LoginRequest peticion) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(peticion.getCorreo(), peticion.getPassword()));

        Usuario usuario = usuarioRepositorio.findByCorreo(peticion.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String rol = usuario.getRol().getNombre();
        String token = jwtServicio.generarToken(usuario.getCorreo(), rol);
        return new AuthResponse(token, usuario.getCorreo(), rol);
    }
}