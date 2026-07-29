package com.manosdeoaxaca.backend.controlador;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.manosdeoaxaca.backend.dto.EspecialidadRespuesta;
import com.manosdeoaxaca.backend.servicio.EspecialidadServicio;

@RestController
@RequestMapping("/api/especialidades")
public class EspecialidadControlador {

    private final EspecialidadServicio especialidadServicio;

    public EspecialidadControlador(EspecialidadServicio especialidadServicio) {
        this.especialidadServicio = especialidadServicio;
    }

    @GetMapping
    public ResponseEntity<List<EspecialidadRespuesta>> listarTodas() {
        return ResponseEntity.ok(especialidadServicio.listarTodas());
    }
}