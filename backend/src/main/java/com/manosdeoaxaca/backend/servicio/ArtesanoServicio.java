package com.manosdeoaxaca.backend.servicio;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.manosdeoaxaca.backend.dto.ArtesanoPeticion;
import com.manosdeoaxaca.backend.dto.ArtesanoRespuesta;
import com.manosdeoaxaca.backend.excepciones.RecursoNoEncontradoExcepcion;
import com.manosdeoaxaca.backend.model.Artesano;
import com.manosdeoaxaca.backend.model.Comunidad;
import com.manosdeoaxaca.backend.model.Especialidad;
import com.manosdeoaxaca.backend.model.Usuario;
import com.manosdeoaxaca.backend.repositorio.ArtesanoRepositorio;
import com.manosdeoaxaca.backend.repositorio.ComunidadRepositorio;
import com.manosdeoaxaca.backend.repositorio.EspecialidadRepositorio;
import com.manosdeoaxaca.backend.repositorio.UsuarioRepositorio;

@Service
public class ArtesanoServicio {

    private final ArtesanoRepositorio artesanoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final ComunidadRepositorio comunidadRepositorio;
    private final EspecialidadRepositorio especialidadRepositorio;

    public ArtesanoServicio(ArtesanoRepositorio artesanoRepositorio, UsuarioRepositorio usuarioRepositorio,
            ComunidadRepositorio comunidadRepositorio, EspecialidadRepositorio especialidadRepositorio) {
        this.artesanoRepositorio = artesanoRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.comunidadRepositorio = comunidadRepositorio;
        this.especialidadRepositorio = especialidadRepositorio;
    }

    public Page<ArtesanoRespuesta> listar(Pageable pageable) {
        return artesanoRepositorio.findAll(pageable).map(this::convertirAResponse);
    }

    public ArtesanoRespuesta obtenerPorId(Long id) {
        Artesano artesano = artesanoRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("No existe el artesano con id: " + id));
        return convertirAResponse(artesano);
    }

    public ArtesanoRespuesta crear(ArtesanoPeticion peticion) {
        Usuario usuario = usuarioRepositorio.findById(peticion.getUsuarioId())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("No existe el usuario con id: " + peticion.getUsuarioId()));

        Comunidad comunidad = comunidadRepositorio.findById(peticion.getComunidadId())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("No existe la comunidad con id: " + peticion.getComunidadId()));

        Artesano artesano = new Artesano();
        artesano.setUsuario(usuario);
        artesano.setComunidad(comunidad);
        artesano.setCurp(peticion.getCurp());
        artesano.setBiografia(peticion.getBiografia());
        artesano.setAniosOficio(peticion.getAniosOficio());
        artesano.setLengua(peticion.getLengua());

        if (peticion.getEspecialidadIds() != null) {
            Set<Especialidad> especialidades = peticion.getEspecialidadIds().stream()
                    .map(idEsp -> especialidadRepositorio.findById(idEsp)
                            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("No existe la especialidad con id: " + idEsp)))
                    .collect(Collectors.toSet());
            artesano.setEspecialidades(especialidades);
        }

        Artesano guardado = artesanoRepositorio.save(artesano);
        return convertirAResponse(guardado);
    }

    public ArtesanoRespuesta actualizar(Long id, ArtesanoPeticion peticion) {
        Artesano artesano = artesanoRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("No existe el artesano con id: " + id));

        Comunidad comunidad = comunidadRepositorio.findById(peticion.getComunidadId())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("No existe la comunidad con id: " + peticion.getComunidadId()));

        artesano.setComunidad(comunidad);
        artesano.setCurp(peticion.getCurp());
        artesano.setBiografia(peticion.getBiografia());
        artesano.setAniosOficio(peticion.getAniosOficio());
        artesano.setLengua(peticion.getLengua());

        if (peticion.getEspecialidadIds() != null) {
            Set<Especialidad> especialidades = peticion.getEspecialidadIds().stream()
                    .map(idEsp -> especialidadRepositorio.findById(idEsp)
                            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("No existe la especialidad con id: " + idEsp)))
                    .collect(Collectors.toSet());
            artesano.setEspecialidades(especialidades);
        }

        Artesano guardado = artesanoRepositorio.save(artesano);
        return convertirAResponse(guardado);
    }

    public void eliminar(Long id) {
        if (!artesanoRepositorio.existsById(id)) {
            throw new RecursoNoEncontradoExcepcion("No existe el artesano con id: " + id);
        }
        artesanoRepositorio.deleteById(id);
    }

    public Page<ArtesanoRespuesta> buscarConFiltros(Long comunidadId, String estadoValidacion, Pageable pageable) {
        Page<Artesano> resultado;

        if (comunidadId != null) {
            resultado = artesanoRepositorio.findByComunidadId(comunidadId, pageable);
        } else if (estadoValidacion != null && !estadoValidacion.isBlank()) {
            resultado = artesanoRepositorio.findByEstadoValidacion(estadoValidacion, pageable);
        } else {
            resultado = artesanoRepositorio.findAll(pageable);
        }

        return resultado.map(this::convertirAResponse);
    }

    private ArtesanoRespuesta convertirAResponse(Artesano artesano) {
        ArtesanoRespuesta dto = new ArtesanoRespuesta();
        dto.setId(artesano.getId());
        dto.setNombreUsuario(artesano.getUsuario().getNombre());
        dto.setCorreo(artesano.getUsuario().getCorreo());
        dto.setComunidad(artesano.getComunidad().getNombre());
        dto.setCurp(enmascararCurp(artesano.getCurp()));
        dto.setAniosOficio(artesano.getAniosOficio());
        dto.setLengua(artesano.getLengua());
        dto.setEstadoValidacion(artesano.getEstadoValidacion());

        Set<String> nombresEspecialidades = artesano.getEspecialidades().stream()
                .map(Especialidad::getNombre)
                .collect(Collectors.toSet());
        dto.setEspecialidades(nombresEspecialidades);

        return dto;
    }

    private String enmascararCurp(String curp) {
        if (curp == null || curp.length() < 10) {
            return curp;
        }
        return curp.substring(0, 6) + "••••" + curp.substring(curp.length() - 4);
    }
}