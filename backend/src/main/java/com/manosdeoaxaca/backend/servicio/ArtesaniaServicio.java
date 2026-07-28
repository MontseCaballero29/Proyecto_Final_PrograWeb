package com.manosdeoaxaca.backend.servicio;

import java.util.List;

import org.springframework.stereotype.Service;

import com.manosdeoaxaca.backend.dto.ArtesaniaPeticion;
import com.manosdeoaxaca.backend.dto.ArtesaniaRespuesta;
import com.manosdeoaxaca.backend.excepciones.RecursoNoEncontradoExcepcion;
import com.manosdeoaxaca.backend.model.Artesania;
import com.manosdeoaxaca.backend.model.Taller;
import com.manosdeoaxaca.backend.repositorio.ArtesaniaRepositorio;
import com.manosdeoaxaca.backend.repositorio.TallerRepositorio;

@Service
public class ArtesaniaServicio {

    private final ArtesaniaRepositorio artesaniaRepositorio;
    private final TallerRepositorio tallerRepositorio;

    public ArtesaniaServicio(
            ArtesaniaRepositorio artesaniaRepositorio,
            TallerRepositorio tallerRepositorio) {

        this.artesaniaRepositorio = artesaniaRepositorio;
        this.tallerRepositorio = tallerRepositorio;
    }

    public List<ArtesaniaRespuesta> listarTodas() {
        return artesaniaRepositorio
                .findAll()
                .stream()
                .map(this::convertirARespuesta)
                .toList();
    }

    public ArtesaniaRespuesta obtenerPorId(Long id) {
        Artesania artesania = buscarEntidadPorId(id);
        return convertirARespuesta(artesania);
    }

    public ArtesaniaRespuesta crear(
            ArtesaniaPeticion peticion) {

        Taller taller = tallerRepositorio
                .findById(peticion.getTallerId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe el taller con id: "
                                        + peticion.getTallerId()
                        )
                );

        Artesania artesania = new Artesania();

        copiarDatos(peticion, artesania, taller);

        Artesania guardada =
                artesaniaRepositorio.save(artesania);

        return convertirARespuesta(guardada);
    }

    public ArtesaniaRespuesta actualizar(
            Long id,
            ArtesaniaPeticion peticion) {

        Artesania artesania = buscarEntidadPorId(id);

        Taller taller = tallerRepositorio
                .findById(peticion.getTallerId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "No existe el taller con id: "
                                        + peticion.getTallerId()
                        )
                );

        copiarDatos(peticion, artesania, taller);

        Artesania actualizada =
                artesaniaRepositorio.save(artesania);

        return convertirARespuesta(actualizada);
    }

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
}