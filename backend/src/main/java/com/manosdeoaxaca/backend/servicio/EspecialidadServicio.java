package com.manosdeoaxaca.backend.servicio;

import java.util.List;

import org.springframework.stereotype.Service;

import com.manosdeoaxaca.backend.dto.EspecialidadRespuesta;
import com.manosdeoaxaca.backend.model.Especialidad;
import com.manosdeoaxaca.backend.repositorio.EspecialidadRepositorio;

@Service
public class EspecialidadServicio {

    private final EspecialidadRepositorio especialidadRepositorio;

    public EspecialidadServicio(EspecialidadRepositorio especialidadRepositorio) {
        this.especialidadRepositorio = especialidadRepositorio;
    }

    public List<EspecialidadRespuesta> listarTodas() {
        return especialidadRepositorio.findAll()
                .stream()
                .map(this::convertirARespuesta)
                .toList();
    }

    private EspecialidadRespuesta convertirARespuesta(Especialidad especialidad) {
        EspecialidadRespuesta respuesta = new EspecialidadRespuesta();
        respuesta.setId(especialidad.getId());
        respuesta.setNombre(especialidad.getNombre());
        respuesta.setDescripcion(especialidad.getDescripcion());
        return respuesta;
    }
}