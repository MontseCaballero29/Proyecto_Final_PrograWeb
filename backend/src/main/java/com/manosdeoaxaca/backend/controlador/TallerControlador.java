package com.manosdeoaxaca.backend.controlador;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

import com.manosdeoaxaca.backend.dto.TallerPeticion;
import com.manosdeoaxaca.backend.dto.TallerRespuesta;
import com.manosdeoaxaca.backend.servicio.TallerServicio;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/talleres")
public class TallerControlador {

    private final TallerServicio tallerServicio;

    public TallerControlador(TallerServicio tallerServicio) {
        this.tallerServicio = tallerServicio;
    }

    @GetMapping
    public ResponseEntity<Page<TallerRespuesta>> listar(
            @RequestParam(required = false) String municipio,
            @PageableDefault(
                    size = 10,
                    sort = "id",
                    direction = Sort.Direction.ASC)
            Pageable pageable) {
        return ResponseEntity.ok(
                tallerServicio.listar(municipio, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TallerRespuesta> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(tallerServicio.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TallerRespuesta> crear(
            @Valid @RequestBody TallerPeticion peticion) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(tallerServicio.crear(peticion));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TallerRespuesta> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody TallerPeticion peticion) {
        return ResponseEntity.ok(
                tallerServicio.actualizar(id, peticion));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        tallerServicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
