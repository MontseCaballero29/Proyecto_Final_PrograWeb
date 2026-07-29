package com.manosdeoaxaca.backend.controlador;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String region,
            @PageableDefault(
                    size = 10,
                    sort = "id",
                    direction = Sort.Direction.ASC)
            Pageable pageable) {
        return ResponseEntity.ok(
                tallerServicio.listar(
                        municipio,
                        busqueda,
                        region,
                        pageable));
    }

    @GetMapping("/mios")
    @PreAuthorize("hasRole('ARTESANO')")
    public ResponseEntity<Page<TallerRespuesta>> listarMios(
            Authentication authentication,
            @PageableDefault(
                    size = 10,
                    sort = "id",
                    direction = Sort.Direction.ASC)
            Pageable pageable) {
        return ResponseEntity.ok(
                tallerServicio.listarPorArtesano(
                        authentication.getName(),
                        pageable));
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
    @PreAuthorize("hasAnyRole('ADMIN', 'ARTESANO')")
    public ResponseEntity<TallerRespuesta> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody TallerPeticion peticion,
            Authentication authentication) {
        return ResponseEntity.ok(
                tallerServicio.actualizar(
                        id,
                        peticion,
                        authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        tallerServicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
