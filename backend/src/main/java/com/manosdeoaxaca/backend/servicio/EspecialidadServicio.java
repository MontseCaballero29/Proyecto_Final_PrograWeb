package com.manosdeoaxaca.backend.servicio;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.manosdeoaxaca.backend.dto.EspecialidadRespuesta;
import com.manosdeoaxaca.backend.excepciones.RecursoNoEncontradoExcepcion;
import com.manosdeoaxaca.backend.model.Artesano;
import com.manosdeoaxaca.backend.model.Especialidad;
import com.manosdeoaxaca.backend.repositorio.ArtesanoRepositorio;
import com.manosdeoaxaca.backend.repositorio.EspecialidadRepositorio;

@Service
public class EspecialidadServicio {

    private final EspecialidadRepositorio especialidadRepositorio;
    private final ArtesanoRepositorio artesanoRepositorio;

    public EspecialidadServicio(
            EspecialidadRepositorio especialidadRepositorio,
            ArtesanoRepositorio artesanoRepositorio) {
        this.especialidadRepositorio = especialidadRepositorio;
        this.artesanoRepositorio = artesanoRepositorio;
    }

    public List<EspecialidadRespuesta> listarTodas() {
        return especialidadRepositorio.findAll()
                .stream()
                .map(this::convertirARespuesta)
                .toList();
    }

    @Transactional
    public void eliminar(Long id) {
        Especialidad especialidad = especialidadRepositorio
                .findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion(
                        "No existe la especialidad con id: " + id));

        for (Artesano artesano : artesanoRepositorio.findAll()) {
            if (artesano.getEspecialidades().remove(especialidad)) {
                artesanoRepositorio.save(artesano);
            }
        }

        especialidadRepositorio.delete(especialidad);
    }

    private EspecialidadRespuesta convertirARespuesta(Especialidad especialidad) {
        EspecialidadRespuesta respuesta = new EspecialidadRespuesta();
        respuesta.setId(especialidad.getId());
        respuesta.setNombre(especialidad.getNombre());
        respuesta.setDescripcion(especialidad.getDescripcion());
        return respuesta;
    }
}