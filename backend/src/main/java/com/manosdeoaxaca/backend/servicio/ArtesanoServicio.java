package com.manosdeoaxaca.backend.servicio;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.manosdeoaxaca.backend.dto.ArtesanoDetalleRespuesta;
import com.manosdeoaxaca.backend.dto.ArtesanoPeticion;
import com.manosdeoaxaca.backend.dto.ArtesanoRespuesta;
import com.manosdeoaxaca.backend.excepciones.ConflictoRecursoExcepcion;
import com.manosdeoaxaca.backend.excepciones.RecursoNoEncontradoExcepcion;
import com.manosdeoaxaca.backend.excepciones.SolicitudInvalidaExcepcion;
import com.manosdeoaxaca.backend.model.Artesano;
import com.manosdeoaxaca.backend.model.Comunidad;
import com.manosdeoaxaca.backend.model.Especialidad;
import com.manosdeoaxaca.backend.model.Rol;
import com.manosdeoaxaca.backend.model.Usuario;
import com.manosdeoaxaca.backend.repositorio.ArtesanoRepositorio;
import com.manosdeoaxaca.backend.repositorio.ComunidadRepositorio;
import com.manosdeoaxaca.backend.repositorio.EspecialidadRepositorio;
import com.manosdeoaxaca.backend.repositorio.RolRepositorio;
import com.manosdeoaxaca.backend.repositorio.UsuarioRepositorio;

@Service
@Transactional(readOnly = true)
public class ArtesanoServicio {

    private final ArtesanoRepositorio artesanoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final ComunidadRepositorio comunidadRepositorio;
    private final EspecialidadRepositorio especialidadRepositorio;
    private final RolRepositorio rolRepositorio;
    private final TwilioMensajeriaServicio twilioMensajeriaServicio;

    public ArtesanoServicio(
            ArtesanoRepositorio artesanoRepositorio,
            UsuarioRepositorio usuarioRepositorio,
            ComunidadRepositorio comunidadRepositorio,
            EspecialidadRepositorio especialidadRepositorio,
            RolRepositorio rolRepositorio,
            TwilioMensajeriaServicio twilioMensajeriaServicio) {
        this.artesanoRepositorio = artesanoRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.comunidadRepositorio = comunidadRepositorio;
        this.especialidadRepositorio = especialidadRepositorio;
        this.rolRepositorio = rolRepositorio;
        this.twilioMensajeriaServicio = twilioMensajeriaServicio;
    }

    public ArtesanoRespuesta obtenerPorId(Long id) {
        return convertirARespuesta(buscarEntidadPorId(id));
    }

    public ArtesanoDetalleRespuesta obtenerDetallePorId(Long id) {
        return convertirADetalle(buscarEntidadPorId(id));
    }

    @Transactional
    public ArtesanoRespuesta crear(ArtesanoPeticion peticion) {
        Usuario usuario = buscarUsuario(peticion.getUsuarioId());

        if (artesanoRepositorio.existsByUsuarioId(usuario.getId())) {
            throw new ConflictoRecursoExcepcion(
                    "El usuario seleccionado ya está registrado como artesano");
        }

        if (!"VISITANTE".equals(usuario.getRol().getNombre())) {
            throw new ConflictoRecursoExcepcion(
                    "Solo un usuario visitante puede registrarse como artesano");
        }

        if (usuario.getTelefono() == null
                || usuario.getTelefono().isBlank()) {
            throw new SolicitudInvalidaExcepcion(
                    "El usuario debe registrar un teléfono celular antes "
                            + "de crear su perfil de artesano");
        }

        Comunidad comunidad = buscarComunidad(peticion.getComunidadId());
        Set<Especialidad> especialidades =
                buscarEspecialidades(peticion.getEspecialidadIds());
        Rol rolArtesano = rolRepositorio
                .findByNombre("ARTESANO")
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion(
                        "No existe el rol ARTESANO"));

        Artesano artesano = new Artesano();
        artesano.setUsuario(usuario);
        copiarDatos(peticion, artesano, comunidad, especialidades);

        usuario.setRol(rolArtesano);
        usuarioRepositorio.save(usuario);

        Artesano guardado = artesanoRepositorio.save(artesano);
        twilioMensajeriaServicio.enviarSmsRegistroArtesano(guardado);

        return convertirARespuesta(guardado);
    }

    @Transactional
    public ArtesanoRespuesta aprobar(Long id, String correoAdministrador) {
        Artesano artesano = buscarEntidadPorId(id);

        if ("APROBADO".equalsIgnoreCase(artesano.getEstadoValidacion())) {
            throw new ConflictoRecursoExcepcion(
                    "El artesano ya se encuentra aprobado");
        }

        Usuario administrador = usuarioRepositorio
                .findByCorreo(correoAdministrador)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion(
                        "No existe el usuario administrador autenticado"));

        artesano.setEstadoValidacion("APROBADO");
        artesano.setValidadoPor(administrador);
        artesano.setValidadoEn(LocalDateTime.now());

        Artesano aprobado = artesanoRepositorio.save(artesano);
        twilioMensajeriaServicio
                .enviarWhatsAppAprobacionArtesano(aprobado);

        return convertirARespuesta(aprobado);
    }

    @Transactional
    public ArtesanoRespuesta actualizar(
            Long id,
            ArtesanoPeticion peticion) {
        Artesano artesano = buscarEntidadPorId(id);

        if (!artesano.getUsuario().getId().equals(
                peticion.getUsuarioId())) {
            throw new ConflictoRecursoExcepcion(
                    "No se puede cambiar el usuario de un artesano");
        }

        Comunidad comunidad = buscarComunidad(
                peticion.getComunidadId());
        Set<Especialidad> especialidades =
                buscarEspecialidades(peticion.getEspecialidadIds());

        copiarDatos(peticion, artesano, comunidad, especialidades);

        return convertirARespuesta(
                artesanoRepositorio.save(artesano));
    }

    @Transactional
    public void eliminar(Long id) {
        Artesano artesano = buscarEntidadPorId(id);
        Usuario usuario = artesano.getUsuario();
        Rol rolVisitante = rolRepositorio
                .findByNombre("VISITANTE")
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe el rol VISITANTE"));

        artesanoRepositorio.delete(artesano);
        usuario.setRol(rolVisitante);
        usuarioRepositorio.save(usuario);
    }

    public Page<ArtesanoRespuesta> buscarConFiltros(
            Long comunidadId,
            String estadoValidacion,
            String busqueda,
            String region,
            Pageable pageable) {
        Page<Artesano> resultado = artesanoRepositorio.buscar(
                comunidadId,
                normalizarFiltro(estadoValidacion),
                normalizarFiltro(busqueda),
                normalizarFiltro(region),
                pageable);

        return resultado.map(this::convertirARespuesta);
    }

    private Artesano buscarEntidadPorId(Long id) {
        return artesanoRepositorio
                .findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe el artesano con id: " + id));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepositorio
                .findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe el usuario con id: " + id));
    }

    private Comunidad buscarComunidad(Long id) {
        return comunidadRepositorio
                .findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe la comunidad con id: " + id));
    }

    private Set<Especialidad> buscarEspecialidades(
            Set<Long> especialidadIds) {
        if (especialidadIds == null
                || especialidadIds.isEmpty()) {
            return new HashSet<>();
        }

        Set<Long> idsSinDuplicados =
                new HashSet<>(especialidadIds);
        Set<Especialidad> especialidades = idsSinDuplicados
                .stream()
                .map(id -> especialidadRepositorio
                        .findById(id)
                        .orElseThrow(() ->
                                new RecursoNoEncontradoExcepcion(
                                        "No existe la especialidad con id: "
                                                + id)))
                .collect(Collectors.toSet());

        return new HashSet<>(especialidades);
    }

    private void copiarDatos(
            ArtesanoPeticion peticion,
            Artesano artesano,
            Comunidad comunidad,
            Set<Especialidad> especialidades) {
        artesano.setComunidad(comunidad);
        artesano.setCurp(limpiarCurp(peticion.getCurp()));
        artesano.setBiografia(limpiarTexto(
                peticion.getBiografia()));
        artesano.setAniosOficio(peticion.getAniosOficio());
        artesano.setLengua(limpiarTexto(peticion.getLengua()));
        artesano.setEspecialidades(especialidades);
    }

    private ArtesanoRespuesta convertirARespuesta(
            Artesano artesano) {
        ArtesanoRespuesta respuesta = new ArtesanoRespuesta();
        respuesta.setId(artesano.getId());
        respuesta.setNombreUsuario(
                artesano.getUsuario().getNombre());
        respuesta.setCorreo(
                artesano.getUsuario().getCorreo());
        respuesta.setComunidad(
                artesano.getComunidad().getNombre());
        respuesta.setCurp(enmascararCurp(
                artesano.getCurp()));
        respuesta.setAniosOficio(
                artesano.getAniosOficio());
        respuesta.setLengua(artesano.getLengua());
        respuesta.setEstadoValidacion(
                artesano.getEstadoValidacion());
        respuesta.setEspecialidades(
                obtenerNombresEspecialidades(artesano));

        return respuesta;
    }

    private ArtesanoDetalleRespuesta convertirADetalle(
            Artesano artesano) {
        ArtesanoDetalleRespuesta respuesta =
                new ArtesanoDetalleRespuesta();
        respuesta.setId(artesano.getId());
        respuesta.setUsuarioId(
                artesano.getUsuario().getId());
        respuesta.setNombreUsuario(
                artesano.getUsuario().getNombre());
        respuesta.setCorreo(
                artesano.getUsuario().getCorreo());
        respuesta.setComunidadId(
                artesano.getComunidad().getId());
        respuesta.setComunidad(
                artesano.getComunidad().getNombre());
        respuesta.setCurp(artesano.getCurp());
        respuesta.setBiografia(artesano.getBiografia());
        respuesta.setAniosOficio(
                artesano.getAniosOficio());
        respuesta.setLengua(artesano.getLengua());
        respuesta.setEstadoValidacion(
                artesano.getEstadoValidacion());
        respuesta.setEspecialidadIds(
                artesano.getEspecialidades()
                        .stream()
                        .map(Especialidad::getId)
                        .collect(Collectors.toCollection(
                                LinkedHashSet::new)));
        respuesta.setEspecialidades(
                obtenerNombresEspecialidades(artesano));

        return respuesta;
    }

    private Set<String> obtenerNombresEspecialidades(
            Artesano artesano) {
        return artesano.getEspecialidades()
                .stream()
                .map(Especialidad::getNombre)
                .sorted()
                .collect(Collectors.toCollection(
                        LinkedHashSet::new));
    }

    private String limpiarCurp(String curp) {
        String texto = limpiarTexto(curp);
        return texto == null ? null : texto.toUpperCase();
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

    private String enmascararCurp(String curp) {
        if (curp == null || curp.length() < 10) {
            return curp;
        }

        return curp.substring(0, 6)
                + "••••"
                + curp.substring(curp.length() - 4);
    }
}
