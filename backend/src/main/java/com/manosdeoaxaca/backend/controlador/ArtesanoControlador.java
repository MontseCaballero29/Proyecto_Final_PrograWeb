package com.manosdeoaxaca.backend.controlador;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.manosdeoaxaca.backend.dto.ArtesanoPeticion;
import com.manosdeoaxaca.backend.dto.ArtesanoRespuesta;
import com.manosdeoaxaca.backend.servicio.ArtesanoServicio;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/artesanos")
public class ArtesanoControlador {

    private final ArtesanoServicio artesanoServicio;

    public ArtesanoControlador(ArtesanoServicio artesanoServicio) {
        this.artesanoServicio = artesanoServicio;
    }

    @GetMapping
    public ResponseEntity<Page<ArtesanoRespuesta>> listar(
            @RequestParam(required = false) Long comunidadId,
            @RequestParam(required = false) String estadoValidacion,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(
                artesanoServicio.buscarConFiltros(comunidadId, estadoValidacion, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArtesanoRespuesta> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(artesanoServicio.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArtesanoRespuesta> crear(@Valid @RequestBody ArtesanoPeticion peticion) {
        ArtesanoRespuesta creado = artesanoServicio.crear(peticion);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArtesanoRespuesta> actualizar(
            @PathVariable Long id, @Valid @RequestBody ArtesanoPeticion peticion) {
        return ResponseEntity.ok(artesanoServicio.actualizar(id, peticion));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        artesanoServicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}