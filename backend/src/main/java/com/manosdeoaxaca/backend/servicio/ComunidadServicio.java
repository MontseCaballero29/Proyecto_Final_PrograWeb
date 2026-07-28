package com.manosdeoaxaca.backend.servicio;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.manosdeoaxaca.backend.dto.ComunidadRespuesta;
import com.manosdeoaxaca.backend.repositorio.ComunidadRepositorio;

@Service
@Transactional(readOnly = true)
public class ComunidadServicio {

    private final ComunidadRepositorio comunidadRepositorio;

    public ComunidadServicio(
            ComunidadRepositorio comunidadRepositorio) {
        this.comunidadRepositorio = comunidadRepositorio;
    }

    public List<ComunidadRespuesta> listarTodas() {
        return comunidadRepositorio
                .findAll(Sort.by("nombre").ascending())
                .stream()
                .map(comunidad -> new ComunidadRespuesta(
                        comunidad.getId(),
                        comunidad.getNombre(),
                        comunidad.getRegion()))
                .toList();
    }
}
