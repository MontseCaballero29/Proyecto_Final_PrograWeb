package com.manosdeoaxaca.backend.servicio;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.manosdeoaxaca.backend.dto.ArtesaniaPeticion;
import com.manosdeoaxaca.backend.dto.ArtesaniaRespuesta;
import com.manosdeoaxaca.backend.excepciones.RecursoNoEncontradoExcepcion;
import com.manosdeoaxaca.backend.model.Artesania;
import com.manosdeoaxaca.backend.model.Taller;
import com.manosdeoaxaca.backend.model.Usuario;
import com.manosdeoaxaca.backend.repositorio.ArtesaniaRepositorio;
import com.manosdeoaxaca.backend.repositorio.TallerRepositorio;
import com.manosdeoaxaca.backend.repositorio.UsuarioRepositorio;

@Service
@Transactional(readOnly = true)
public class ArtesaniaServicio {

    private final ArtesaniaRepositorio artesaniaRepositorio;
    private final TallerRepositorio tallerRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;

    public ArtesaniaServicio(
            ArtesaniaRepositorio artesaniaRepositorio,
            TallerRepositorio tallerRepositorio,
            UsuarioRepositorio usuarioRepositorio) {

        this.artesaniaRepositorio = artesaniaRepositorio;
        this.tallerRepositorio = tallerRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
    }

    public Page<ArtesaniaRespuesta> listar(
            String busqueda,
            String region,
            Pageable pageable) {
        return artesaniaRepositorio
                .buscar(
                        normalizarFiltro(busqueda),
                        normalizarFiltro(region),
                        pageable)
                .map(this::convertirARespuesta);
    }

    public Page<ArtesaniaRespuesta> listarPorArtesano(
            String correo,
            Pageable pageable) {
        return artesaniaRepositorio
                .buscarPorArtesano(correo, pageable)
                .map(this::convertirARespuesta);
    }

    public ArtesaniaRespuesta obtenerPorId(Long id) {
        Artesania artesania = buscarEntidadPorId(id);
        return convertirARespuesta(artesania);
    }

    @Transactional
    public ArtesaniaRespuesta crear(
            ArtesaniaPeticion peticion,
            String correo) {

        Taller taller = tallerRepositorio
                .findById(peticion.getTallerId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe el taller con id: "
                                        + peticion.getTallerId()
                        )
                );

        validarPermisoSobreTaller(taller, correo);

        Artesania artesania = new Artesania();

        copiarDatos(peticion, artesania, taller);

        Artesania guardada =
                artesaniaRepositorio.save(artesania);

        return convertirARespuesta(guardada);
    }

    @Transactional
    public ArtesaniaRespuesta actualizar(
            Long id,
            ArtesaniaPeticion peticion,
            String correo) {

        Artesania artesania = buscarEntidadPorId(id);
        validarPermisoSobreTaller(
                artesania.getTaller(),
                correo);

        Taller taller = tallerRepositorio
                .findById(peticion.getTallerId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe el taller con id: "
                                        + peticion.getTallerId()
                        )
                );

        validarPermisoSobreTaller(taller, correo);

        copiarDatos(peticion, artesania, taller);

        Artesania actualizada =
                artesaniaRepositorio.save(artesania);

        return convertirARespuesta(actualizada);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!artesaniaRepositorio.existsById(id)) {
            throw new RecursoNoEncontradoExcepcion(
                    "No existe la artesanía con id: " + id
            );
        }

        artesaniaRepositorio.deleteById(id);
    }

    private Artesania buscarEntidadPorId(Long id) {
        return artesaniaRepositorio
                .findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe la artesanía con id: "
                                        + id
                        )
                );
    }

    private void validarPermisoSobreTaller(
            Taller taller,
            String correo) {
        Usuario usuario = usuarioRepositorio
                .findByCorreo(correo)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe la cuenta solicitada"));

        if ("ADMIN".equals(usuario.getRol().getNombre())) {
            return;
        }

        boolean pertenece = taller.getArtesanos()
                .stream()
                .anyMatch(artesano ->
                        artesano.getUsuario()
                                .getCorreo()
                                .equalsIgnoreCase(correo));

        if (!pertenece) {
            throw new AccessDeniedException(
                    "No puedes administrar artesanías de un taller ajeno");
        }
    }

    private void copiarDatos(
            ArtesaniaPeticion peticion,
            Artesania artesania,
            Taller taller) {

        artesania.setNombre(
                peticion.getNombre().trim()
        );

        artesania.setDescripcion(
                limpiarTexto(peticion.getDescripcion())
        );

        artesania.setPrecio(
                peticion.getPrecio()
        );

        artesania.setExistencia(
                peticion.getExistencia()
        );

        artesania.setImagenUrl(
                limpiarTexto(peticion.getImagenUrl())
        );

        artesania.setTaller(taller);
    }

    private ArtesaniaRespuesta convertirARespuesta(
            Artesania artesania) {

        ArtesaniaRespuesta respuesta =
                new ArtesaniaRespuesta();

        respuesta.setId(artesania.getId());
        respuesta.setNombre(artesania.getNombre());
        respuesta.setDescripcion(
                artesania.getDescripcion()
        );
        respuesta.setPrecio(artesania.getPrecio());
        respuesta.setExistencia(
                artesania.getExistencia()
        );
        respuesta.setImagenUrl(
                artesania.getImagenUrl()
        );

        respuesta.setTallerId(
                artesania.getTaller().getId()
        );

        respuesta.setTaller(
                artesania.getTaller().getNombre()
        );

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
