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

import com.manosdeoaxaca.backend.dto.ResenaPeticion;
import com.manosdeoaxaca.backend.dto.ResenaRespuesta;
import com.manosdeoaxaca.backend.servicio.ResenaServicio;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/resenas")
public class ResenaControlador {

    private final ResenaServicio resenaServicio;

    public ResenaControlador(ResenaServicio resenaServicio) {
        this.resenaServicio = resenaServicio;
    }

    @GetMapping
    public ResponseEntity<Page<ResenaRespuesta>> listar(
            @RequestParam(required = false) String tipoRecurso,
            @RequestParam(required = false) Long recursoId,
            @PageableDefault(
                    size = 10,
                    sort = "creadoEn",
                    direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(
                resenaServicio.listar(
                        tipoRecurso,
                        recursoId,
                        pageable));
    }

    @GetMapping("/mias")
    @PreAuthorize("hasRole('VISITANTE')")
    public ResponseEntity<Page<ResenaRespuesta>> listarMias(
            Authentication authentication,
            @PageableDefault(
                    size = 10,
                    sort = "creadoEn",
                    direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(
                resenaServicio.listarPropias(
                        authentication.getName(),
                        pageable));
    }

    @PostMapping
    @PreAuthorize("hasRole('VISITANTE')")
    public ResponseEntity<ResenaRespuesta> crear(
            Authentication authentication,
            @Valid @RequestBody ResenaPeticion peticion) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resenaServicio.crear(
                        authentication.getName(),
                        peticion));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VISITANTE')")
    public ResponseEntity<ResenaRespuesta> actualizar(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody ResenaPeticion peticion) {
        return ResponseEntity.ok(
                resenaServicio.actualizar(
                        id,
                        authentication.getName(),
                        peticion));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('VISITANTE', 'ADMIN')")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            Authentication authentication) {
        resenaServicio.eliminar(
                id,
                authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
