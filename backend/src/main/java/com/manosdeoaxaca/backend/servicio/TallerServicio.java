package com.manosdeoaxaca.backend.servicio;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.manosdeoaxaca.backend.dto.TallerPeticion;
import com.manosdeoaxaca.backend.dto.TallerRespuesta;
import com.manosdeoaxaca.backend.excepciones.RecursoNoEncontradoExcepcion;
import com.manosdeoaxaca.backend.model.Artesano;
import com.manosdeoaxaca.backend.model.Comunidad;
import com.manosdeoaxaca.backend.model.Especialidad;
import com.manosdeoaxaca.backend.model.Taller;
import com.manosdeoaxaca.backend.repositorio.ArtesanoRepositorio;
import com.manosdeoaxaca.backend.repositorio.ComunidadRepositorio;
import com.manosdeoaxaca.backend.repositorio.TallerRepositorio;

@Service
@Transactional(readOnly = true)
public class TallerServicio {

    private final TallerRepositorio tallerRepositorio;
    private final ComunidadRepositorio comunidadRepositorio;
    private final ArtesanoRepositorio artesanoRepositorio;

    public TallerServicio(
            TallerRepositorio tallerRepositorio,
            ComunidadRepositorio comunidadRepositorio,
            ArtesanoRepositorio artesanoRepositorio) {
        this.tallerRepositorio = tallerRepositorio;
        this.comunidadRepositorio = comunidadRepositorio;
        this.artesanoRepositorio = artesanoRepositorio;
    }

    public Page<TallerRespuesta> listar(
            String municipio,
            Pageable pageable) {
        Page<Taller> resultado;

        if (municipio == null || municipio.isBlank()) {
            resultado = tallerRepositorio.findAll(pageable);
        } else {
            resultado = tallerRepositorio
                    .findByMunicipioContainingIgnoreCase(
                            municipio.trim(),
                            pageable);
        }

        return resultado.map(this::convertirARespuesta);
    }

    public TallerRespuesta buscarPorId(Long id) {
        return convertirARespuesta(buscarEntidadPorId(id));
    }

    @Transactional
    public TallerRespuesta crear(TallerPeticion peticion) {
        Comunidad comunidad = buscarComunidad(
                peticion.getComunidadId());
        Set<Artesano> artesanos = buscarArtesanos(
                peticion.getArtesanoIds());

        Taller taller = new Taller();
        copiarDatos(peticion, taller, comunidad, artesanos);

        return convertirARespuesta(
                tallerRepositorio.save(taller));
    }

    @Transactional
    public TallerRespuesta actualizar(
            Long id,
            TallerPeticion peticion) {
        Taller taller = buscarEntidadPorId(id);
        Comunidad comunidad = buscarComunidad(
                peticion.getComunidadId());
        Set<Artesano> artesanos = buscarArtesanos(
                peticion.getArtesanoIds());

        copiarDatos(peticion, taller, comunidad, artesanos);

        return convertirARespuesta(
                tallerRepositorio.save(taller));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!tallerRepositorio.existsById(id)) {
            throw new RecursoNoEncontradoExcepcion(
                    "No existe el taller con id: " + id);
        }

        tallerRepositorio.deleteById(id);
    }

    private Taller buscarEntidadPorId(Long id) {
        return tallerRepositorio
                .findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe el taller con id: " + id));
    }

    private Comunidad buscarComunidad(Long id) {
        return comunidadRepositorio
                .findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe la comunidad con id: " + id));
    }

    private Set<Artesano> buscarArtesanos(
            Set<Long> artesanoIds) {
        if (artesanoIds == null || artesanoIds.isEmpty()) {
            return new HashSet<>();
        }

        Set<Long> idsSinDuplicados =
                new HashSet<>(artesanoIds);
        List<Artesano> encontrados =
                artesanoRepositorio.findAllById(idsSinDuplicados);

        if (encontrados.size() != idsSinDuplicados.size()) {
            Set<Long> idsEncontrados = encontrados
                    .stream()
                    .map(Artesano::getId)
                    .collect(Collectors.toSet());

            Long idFaltante = idsSinDuplicados
                    .stream()
                    .filter(id -> !idsEncontrados.contains(id))
                    .findFirst()
                    .orElse(null);

            throw new RecursoNoEncontradoExcepcion(
                    "No existe el artesano con id: " + idFaltante);
        }

        return new HashSet<>(encontrados);
    }

    private void copiarDatos(
            TallerPeticion peticion,
            Taller taller,
            Comunidad comunidad,
            Set<Artesano> artesanos) {
        taller.setNombre(peticion.getNombre().trim());
        taller.setDescripcion(
                limpiarTexto(peticion.getDescripcion()));
        taller.setDireccion(peticion.getDireccion().trim());
        taller.setMunicipio(peticion.getMunicipio().trim());
        taller.setComunidad(comunidad);
        taller.setArtesanos(artesanos);
    }

    private TallerRespuesta convertirARespuesta(
            Taller taller) {
        TallerRespuesta respuesta = new TallerRespuesta();

        respuesta.setId(taller.getId());
        respuesta.setNombre(taller.getNombre());
        respuesta.setDescripcion(taller.getDescripcion());
        respuesta.setDireccion(taller.getDireccion());
        respuesta.setMunicipio(taller.getMunicipio());
        respuesta.setComunidadId(
                taller.getComunidad().getId());
        respuesta.setComunidad(
                taller.getComunidad().getNombre());

        Set<Long> artesanoIds = taller
                .getArtesanos()
                .stream()
                .map(Artesano::getId)
                .collect(Collectors.toCollection(
                        LinkedHashSet::new));
        respuesta.setArtesanoIds(artesanoIds);

        Set<String> artesanos = taller
                .getArtesanos()
                .stream()
                .map(artesano ->
                        artesano.getUsuario().getNombre())
                .sorted()
                .collect(Collectors.toCollection(
                        LinkedHashSet::new));
        respuesta.setArtesanos(artesanos);

        Set<String> especialidades = taller
                .getArtesanos()
                .stream()
                .flatMap(artesano ->
                        artesano.getEspecialidades().stream())
                .map(Especialidad::getNombre)
                .sorted()
                .collect(Collectors.toCollection(
                        LinkedHashSet::new));
        respuesta.setEspecialidades(especialidades);

        return respuesta;
    }

    private String limpiarTexto(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }

        return texto.trim();
    }
}
