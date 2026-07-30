package com.manosdeoaxaca.backend.servicio;

import java.time.LocalDateTime;
import java.util.UUID;

import com.manosdeoaxaca.backend.dto.RecuperarRequest;
import com.manosdeoaxaca.backend.dto.RestablecerRequest;
import com.manosdeoaxaca.backend.model.PasswordResetToken;
import com.manosdeoaxaca.backend.repositorio.PasswordResetTokenRepositorio;

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
    private final PasswordResetTokenRepositorio passwordResetTokenRepositorio;
    private final CorreoServicio correoServicio;

    public AuthServicio(UsuarioRepositorio usuarioRepositorio, RolRepositorio rolRepositorio,
            PasswordEncoder passwordEncoder, JwtServicio jwtServicio,
            AuthenticationManager authenticationManager,
            PasswordResetTokenRepositorio passwordResetTokenRepositorio,
            CorreoServicio correoServicio) {
        this.usuarioRepositorio = usuarioRepositorio;
        this.rolRepositorio = rolRepositorio;
        this.passwordEncoder = passwordEncoder;
        this.jwtServicio = jwtServicio;
        this.authenticationManager = authenticationManager;
        this.passwordResetTokenRepositorio = passwordResetTokenRepositorio;
        this.correoServicio = correoServicio;
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
        usuario.setTelefono(peticion.getTelefono().trim());
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
    
    public void recuperarPassword(RecuperarRequest peticion) {
        Usuario usuario = usuarioRepositorio.findByCorreo(peticion.getCorreo())
                .orElse(null);

        if (usuario == null) {
            return;
        }

        String token = UUID.randomUUID().toString();

        PasswordResetToken tokenRecuperacion = new PasswordResetToken();
        tokenRecuperacion.setToken(token);
        tokenRecuperacion.setUsuario(usuario);
        tokenRecuperacion.setExpiraEn(LocalDateTime.now().plusHours(1));

        passwordResetTokenRepositorio.save(tokenRecuperacion);

        correoServicio.enviarCorreoRecuperacion(usuario.getCorreo(), token);
    }

    public void restablecerPassword(RestablecerRequest peticion) {
        PasswordResetToken tokenRecuperacion = passwordResetTokenRepositorio
                .findByToken(peticion.getToken())
                .orElseThrow(() -> new RuntimeException("El enlace de recuperación no es válido"));

        if (tokenRecuperacion.isUsado()) {
            throw new RuntimeException("El enlace de recuperación ya fue utilizado");
        }

        if (tokenRecuperacion.getExpiraEn().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El enlace de recuperación ha expirado");
        }

        Usuario usuario = tokenRecuperacion.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(peticion.getPassword()));
        usuarioRepositorio.save(usuario);

        tokenRecuperacion.setUsado(true);
        passwordResetTokenRepositorio.save(tokenRecuperacion);
    }
}