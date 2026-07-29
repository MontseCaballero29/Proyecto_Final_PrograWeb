package com.manosdeoaxaca.backend.servicio;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.manosdeoaxaca.backend.dto.ActualizarCuentaPeticion;
import com.manosdeoaxaca.backend.dto.CambiarPasswordPeticion;
import com.manosdeoaxaca.backend.dto.CuentaRespuesta;
import com.manosdeoaxaca.backend.dto.UsuarioDisponibleRespuesta;
import com.manosdeoaxaca.backend.excepciones.ConflictoRecursoExcepcion;
import com.manosdeoaxaca.backend.excepciones.RecursoNoEncontradoExcepcion;
import com.manosdeoaxaca.backend.excepciones.SolicitudInvalidaExcepcion;
import com.manosdeoaxaca.backend.model.Usuario;
import com.manosdeoaxaca.backend.repositorio.ArtesanoRepositorio;
import com.manosdeoaxaca.backend.repositorio.UsuarioRepositorio;
import com.manosdeoaxaca.backend.seguridad.JwtServicio;

@Service
@Transactional(readOnly = true)
public class UsuarioServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final ArtesanoRepositorio artesanoRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final JwtServicio jwtServicio;

    public UsuarioServicio(
            UsuarioRepositorio usuarioRepositorio,
            ArtesanoRepositorio artesanoRepositorio,
            PasswordEncoder passwordEncoder,
            JwtServicio jwtServicio) {
        this.usuarioRepositorio = usuarioRepositorio;
        this.artesanoRepositorio = artesanoRepositorio;
        this.passwordEncoder = passwordEncoder;
        this.jwtServicio = jwtServicio;
    }

    public List<UsuarioDisponibleRespuesta> listarDisponiblesParaArtesano() {
        return usuarioRepositorio
                .findByActivoTrueAndRolNombreOrderByNombreAsc("VISITANTE")
                .stream()
                .filter(usuario ->
                        !artesanoRepositorio.existsByUsuarioId(usuario.getId()))
                .map(usuario -> new UsuarioDisponibleRespuesta(
                        usuario.getId(),
                        usuario.getNombre(),
                        usuario.getCorreo()))
                .toList();
    }

    public CuentaRespuesta obtenerCuenta(String correo) {
        return convertirCuenta(buscarPorCorreo(correo), null);
    }

    @Transactional
    public CuentaRespuesta actualizarCuenta(
            String correoActual,
            ActualizarCuentaPeticion peticion) {
        Usuario usuario = buscarPorCorreo(correoActual);
        String correoNuevo = peticion.getCorreo().trim().toLowerCase();

        if (usuarioRepositorio.existsByCorreoAndIdNot(
                correoNuevo,
                usuario.getId())) {
            throw new ConflictoRecursoExcepcion(
                    "Ya existe una cuenta con ese correo");
        }

        usuario.setNombre(peticion.getNombre().trim());
        usuario.setCorreo(correoNuevo);
        usuarioRepositorio.save(usuario);

        String token = jwtServicio.generarToken(
                usuario.getCorreo(),
                usuario.getRol().getNombre());

        return convertirCuenta(usuario, token);
    }

    @Transactional
    public void cambiarPassword(
            String correo,
            CambiarPasswordPeticion peticion) {
        Usuario usuario = buscarPorCorreo(correo);

        if (!passwordEncoder.matches(
                peticion.getPasswordActual(),
                usuario.getPasswordHash())) {
            throw new SolicitudInvalidaExcepcion(
                    "La contraseña actual no es correcta");
        }

        if (passwordEncoder.matches(
                peticion.getPasswordNueva(),
                usuario.getPasswordHash())) {
            throw new ConflictoRecursoExcepcion(
                    "La contraseña nueva debe ser diferente a la actual");
        }

        usuario.setPasswordHash(
                passwordEncoder.encode(peticion.getPasswordNueva()));
        usuarioRepositorio.save(usuario);
    }

    public Usuario buscarPorCorreo(String correo) {
        return usuarioRepositorio
                .findByCorreo(correo)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe la cuenta solicitada"));
    }

    private CuentaRespuesta convertirCuenta(
            Usuario usuario,
            String token) {
        return new CuentaRespuesta(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getRol().getNombre(),
                token);
    }
}
