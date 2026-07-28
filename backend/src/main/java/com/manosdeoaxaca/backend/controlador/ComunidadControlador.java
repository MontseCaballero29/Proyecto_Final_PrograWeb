package com.manosdeoaxaca.backend.controlador;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.manosdeoaxaca.backend.dto.ComunidadRespuesta;
import com.manosdeoaxaca.backend.servicio.ComunidadServicio;

@RestController
@RequestMapping("/api/comunidades")
public class ComunidadControlador {

    private final ComunidadServicio comunidadServicio;

    public ComunidadControlador(
            ComunidadServicio comunidadServicio) {
        this.comunidadServicio = comunidadServicio;
    }

    @GetMapping
    public ResponseEntity<List<ComunidadRespuesta>> listarTodas() {
        return ResponseEntity.ok(
                comunidadServicio.listarTodas());
    }
}
