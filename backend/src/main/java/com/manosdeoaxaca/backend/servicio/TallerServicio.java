package com.manosdeoaxaca.backend.servicio;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.manosdeoaxaca.backend.dto.TallerPeticion;
import com.manosdeoaxaca.backend.dto.TallerRespuesta;
import com.manosdeoaxaca.backend.excepciones.RecursoNoEncontradoExcepcion;
import com.manosdeoaxaca.backend.model.Artesano;
import com.manosdeoaxaca.backend.model.Comunidad;
import com.manosdeoaxaca.backend.model.Especialidad;
import com.manosdeoaxaca.backend.model.Taller;
import com.manosdeoaxaca.backend.model.Usuario;
import com.manosdeoaxaca.backend.repositorio.ArtesanoRepositorio;
import com.manosdeoaxaca.backend.repositorio.ComunidadRepositorio;
import com.manosdeoaxaca.backend.repositorio.TallerRepositorio;
import com.manosdeoaxaca.backend.repositorio.UsuarioRepositorio;

@Service
@Transactional(readOnly = true)
public class TallerServicio {

    private final TallerRepositorio tallerRepositorio;
    private final ComunidadRepositorio comunidadRepositorio;
    private final ArtesanoRepositorio artesanoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;

    public TallerServicio(
            TallerRepositorio tallerRepositorio,
            ComunidadRepositorio comunidadRepositorio,
            ArtesanoRepositorio artesanoRepositorio,
            UsuarioRepositorio usuarioRepositorio) {
        this.tallerRepositorio = tallerRepositorio;
        this.comunidadRepositorio = comunidadRepositorio;
        this.artesanoRepositorio = artesanoRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
    }

    public Page<TallerRespuesta> listar(
            String municipio,
            String busqueda,
            String region,
            Pageable pageable) {
        Page<Taller> resultado = tallerRepositorio.buscar(
                normalizarFiltro(municipio),
                normalizarFiltro(busqueda),
                normalizarFiltro(region),
                pageable);

        return resultado.map(this::convertirARespuesta);
    }

    public Page<TallerRespuesta> listarPorArtesano(
            String correo,
            Pageable pageable) {
        return tallerRepositorio
                .buscarPorArtesano(correo, pageable)
                .map(this::convertirARespuesta);
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
            TallerPeticion peticion,
            String correo) {
        Taller taller = buscarEntidadPorId(id);
        Usuario usuario = buscarUsuario(correo);
        boolean esAdmin = "ADMIN".equals(
                usuario.getRol().getNombre());

        if (!esAdmin && !perteneceAlTaller(taller, correo)) {
            throw new AccessDeniedException(
                    "No puedes modificar un taller que no te pertenece");
        }

        Comunidad comunidad = buscarComunidad(
                peticion.getComunidadId());
        Set<Artesano> artesanos = esAdmin
                ? buscarArtesanos(peticion.getArtesanoIds())
                : new HashSet<>(taller.getArtesanos());

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

    private Usuario buscarUsuario(String correo) {
        return usuarioRepositorio
                .findByCorreo(correo)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe la cuenta solicitada"));
    }

    private boolean perteneceAlTaller(
            Taller taller,
            String correo) {
        return taller.getArtesanos()
                .stream()
                .anyMatch(artesano ->
                        artesano.getUsuario()
                                .getCorreo()
                                .equalsIgnoreCase(correo));
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

    private String normalizarFiltro(String texto) {
        return texto == null || texto.isBlank()
                ? null
                : texto.trim();
    }
}
