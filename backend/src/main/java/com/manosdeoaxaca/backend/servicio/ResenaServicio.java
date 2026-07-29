package com.manosdeoaxaca.backend.servicio;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.manosdeoaxaca.backend.dto.ResenaPeticion;
import com.manosdeoaxaca.backend.dto.ResenaRespuesta;
import com.manosdeoaxaca.backend.excepciones.ConflictoRecursoExcepcion;
import com.manosdeoaxaca.backend.excepciones.RecursoNoEncontradoExcepcion;
import com.manosdeoaxaca.backend.model.Artesania;
import com.manosdeoaxaca.backend.model.Artesano;
import com.manosdeoaxaca.backend.model.Resena;
import com.manosdeoaxaca.backend.model.Taller;
import com.manosdeoaxaca.backend.model.Usuario;
import com.manosdeoaxaca.backend.repositorio.ArtesaniaRepositorio;
import com.manosdeoaxaca.backend.repositorio.ArtesanoRepositorio;
import com.manosdeoaxaca.backend.repositorio.ResenaRepositorio;
import com.manosdeoaxaca.backend.repositorio.TallerRepositorio;
import com.manosdeoaxaca.backend.repositorio.UsuarioRepositorio;

@Service
@Transactional(readOnly = true)
public class ResenaServicio {

    private final ResenaRepositorio resenaRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final ArtesanoRepositorio artesanoRepositorio;
    private final TallerRepositorio tallerRepositorio;
    private final ArtesaniaRepositorio artesaniaRepositorio;

    public ResenaServicio(
            ResenaRepositorio resenaRepositorio,
            UsuarioRepositorio usuarioRepositorio,
            ArtesanoRepositorio artesanoRepositorio,
            TallerRepositorio tallerRepositorio,
            ArtesaniaRepositorio artesaniaRepositorio) {
        this.resenaRepositorio = resenaRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.artesanoRepositorio = artesanoRepositorio;
        this.tallerRepositorio = tallerRepositorio;
        this.artesaniaRepositorio = artesaniaRepositorio;
    }

    public Page<ResenaRespuesta> listar(
            String tipoRecurso,
            Long recursoId,
            Pageable pageable) {
        if (tipoRecurso == null || tipoRecurso.isBlank()
                || recursoId == null) {
            return resenaRepositorio
                    .findAll(pageable)
                    .map(this::convertir);
        }

        String tipo = tipoRecurso.trim().toUpperCase();

        return switch (tipo) {
            case "ARTESANO" -> resenaRepositorio
                    .findByArtesanoId(recursoId, pageable)
                    .map(this::convertir);
            case "TALLER" -> resenaRepositorio
                    .findByTallerId(recursoId, pageable)
                    .map(this::convertir);
            case "ARTESANIA" -> resenaRepositorio
                    .findByArtesaniaId(recursoId, pageable)
                    .map(this::convertir);
            default -> throw new ConflictoRecursoExcepcion(
                    "El tipo de recurso no es válido");
        };
    }

    public Page<ResenaRespuesta> listarPropias(
            String correo,
            Pageable pageable) {
        return resenaRepositorio
                .findByUsuarioCorreo(correo, pageable)
                .map(this::convertir);
    }

    @Transactional
    public ResenaRespuesta crear(
            String correo,
            ResenaPeticion peticion) {
        Usuario usuario = buscarUsuario(correo);
        String tipo = peticion.getTipoRecurso()
                .trim()
                .toUpperCase();

        validarDuplicado(
                correo,
                tipo,
                peticion.getRecursoId());

        Resena resena = new Resena();
        resena.setUsuario(usuario);
        asignarRecurso(
                resena,
                tipo,
                peticion.getRecursoId());
        copiarContenido(peticion, resena);

        return convertir(resenaRepositorio.save(resena));
    }

    @Transactional
    public ResenaRespuesta actualizar(
            Long id,
            String correo,
            ResenaPeticion peticion) {
        Resena resena = buscarPorId(id);

        if (!resena.getUsuario()
                .getCorreo()
                .equalsIgnoreCase(correo)) {
            throw new AccessDeniedException(
                    "No puedes modificar una reseña ajena");
        }

        copiarContenido(peticion, resena);
        return convertir(resenaRepositorio.save(resena));
    }

    @Transactional
    public void eliminar(Long id, String correo) {
        Resena resena = buscarPorId(id);
        Usuario usuario = buscarUsuario(correo);
        boolean esAdmin = "ADMIN".equals(
                usuario.getRol().getNombre());
        boolean esPropia = resena.getUsuario()
                .getId()
                .equals(usuario.getId());

        if (!esAdmin && !esPropia) {
            throw new AccessDeniedException(
                    "No puedes eliminar una reseña ajena");
        }

        resenaRepositorio.delete(resena);
    }

    private void asignarRecurso(
            Resena resena,
            String tipo,
            Long recursoId) {
        switch (tipo) {
            case "ARTESANO" -> resena.setArtesano(
                    artesanoRepositorio
                            .findById(recursoId)
                            .orElseThrow(() ->
                                    new RecursoNoEncontradoExcepcion(
                                            "No existe el artesano seleccionado")));
            case "TALLER" -> resena.setTaller(
                    tallerRepositorio
                            .findById(recursoId)
                            .orElseThrow(() ->
                                    new RecursoNoEncontradoExcepcion(
                                            "No existe el taller seleccionado")));
            case "ARTESANIA" -> resena.setArtesania(
                    artesaniaRepositorio
                            .findById(recursoId)
                            .orElseThrow(() ->
                                    new RecursoNoEncontradoExcepcion(
                                            "No existe la artesanía seleccionada")));
            default -> throw new ConflictoRecursoExcepcion(
                    "El tipo de recurso no es válido");
        }
    }

    private void validarDuplicado(
            String correo,
            String tipo,
            Long recursoId) {
        Optional<Resena> existente = switch (tipo) {
            case "ARTESANO" -> resenaRepositorio
                    .findByUsuarioCorreoAndArtesanoId(
                            correo,
                            recursoId);
            case "TALLER" -> resenaRepositorio
                    .findByUsuarioCorreoAndTallerId(
                            correo,
                            recursoId);
            case "ARTESANIA" -> resenaRepositorio
                    .findByUsuarioCorreoAndArtesaniaId(
                            correo,
                            recursoId);
            default -> throw new ConflictoRecursoExcepcion(
                    "El tipo de recurso no es válido");
        };

        if (existente.isPresent()) {
            throw new ConflictoRecursoExcepcion(
                    "Ya publicaste una reseña para este elemento");
        }
    }

    private void copiarContenido(
            ResenaPeticion peticion,
            Resena resena) {
        resena.setCalificacion(peticion.getCalificacion());
        resena.setComentario(peticion.getComentario().trim());
    }

    private Usuario buscarUsuario(String correo) {
        return usuarioRepositorio
                .findByCorreo(correo)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe la cuenta solicitada"));
    }

    private Resena buscarPorId(Long id) {
        return resenaRepositorio
                .findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe la reseña solicitada"));
    }

    private ResenaRespuesta convertir(Resena resena) {
        ResenaRespuesta respuesta = new ResenaRespuesta();
        respuesta.setId(resena.getId());
        respuesta.setCalificacion(resena.getCalificacion());
        respuesta.setComentario(resena.getComentario());
        respuesta.setAutor(resena.getUsuario().getNombre());
        respuesta.setCorreoAutor(
                resena.getUsuario().getCorreo());
        respuesta.setCreadoEn(resena.getCreadoEn());

        if (resena.getArtesano() != null) {
            Artesano artesano = resena.getArtesano();
            respuesta.setTipoRecurso("ARTESANO");
            respuesta.setRecursoId(artesano.getId());
            respuesta.setRecursoNombre(
                    artesano.getUsuario().getNombre());
        } else if (resena.getTaller() != null) {
            Taller taller = resena.getTaller();
            respuesta.setTipoRecurso("TALLER");
            respuesta.setRecursoId(taller.getId());
            respuesta.setRecursoNombre(taller.getNombre());
        } else {
            Artesania artesania = resena.getArtesania();
            respuesta.setTipoRecurso("ARTESANIA");
            respuesta.setRecursoId(artesania.getId());
            respuesta.setRecursoNombre(artesania.getNombre());
        }

        return respuesta;
    }
}
