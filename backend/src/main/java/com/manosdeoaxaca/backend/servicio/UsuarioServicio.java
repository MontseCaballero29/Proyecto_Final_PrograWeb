package com.manosdeoaxaca.backend.servicio;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.manosdeoaxaca.backend.dto.UsuarioDisponibleRespuesta;
import com.manosdeoaxaca.backend.repositorio.ArtesanoRepositorio;
import com.manosdeoaxaca.backend.repositorio.UsuarioRepositorio;

@Service
@Transactional(readOnly = true)
public class UsuarioServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final ArtesanoRepositorio artesanoRepositorio;

    public UsuarioServicio(
            UsuarioRepositorio usuarioRepositorio,
            ArtesanoRepositorio artesanoRepositorio) {
        this.usuarioRepositorio = usuarioRepositorio;
        this.artesanoRepositorio = artesanoRepositorio;
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
}
