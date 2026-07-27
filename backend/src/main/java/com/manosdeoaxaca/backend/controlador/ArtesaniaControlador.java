package com.manosdeoaxaca.backend.controlador;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.manosdeoaxaca.backend.dto.ArtesaniaPeticion;
import com.manosdeoaxaca.backend.dto.ArtesaniaRespuesta;
import com.manosdeoaxaca.backend.servicio.ArtesaniaServicio;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/artesanias")
public class ArtesaniaControlador {

    private final ArtesaniaServicio artesaniaServicio;

    public ArtesaniaControlador(
            ArtesaniaServicio artesaniaServicio) {

        this.artesaniaServicio = artesaniaServicio;
    }

    @GetMapping
    public ResponseEntity<List<ArtesaniaRespuesta>>
            listarTodas() {

        return ResponseEntity.ok(
                artesaniaServicio.listarTodas()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArtesaniaRespuesta>
            obtenerPorId(@PathVariable Long id) {

        try {
            return ResponseEntity.ok(
                    artesaniaServicio.obtenerPorId(id)
            );
        } catch (IllegalArgumentException excepcion) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArtesaniaRespuesta> crear(
            @Valid
            @RequestBody ArtesaniaPeticion peticion) {

        ArtesaniaRespuesta creada =
                artesaniaServicio.crear(peticion);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(creada);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArtesaniaRespuesta> actualizar(
            @PathVariable Long id,
            @Valid
            @RequestBody ArtesaniaPeticion peticion) {

        try {
            return ResponseEntity.ok(
                    artesaniaServicio.actualizar(
                            id,
                            peticion
                    )
            );
        } catch (IllegalArgumentException excepcion) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        try {
            artesaniaServicio.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException excepcion) {
            return ResponseEntity.notFound().build();
        }
    }
}