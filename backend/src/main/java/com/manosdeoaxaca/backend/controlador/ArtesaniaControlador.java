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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.manosdeoaxaca.backend.dto.ArtesaniaPeticion;
import com.manosdeoaxaca.backend.dto.ArtesaniaRespuesta;
import com.manosdeoaxaca.backend.servicio.ArtesaniaServicio;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/artesanias")
public class ArtesaniaControlador {

    private final ArtesaniaServicio artesaniaServicio;

    public ArtesaniaControlador(ArtesaniaServicio artesaniaServicio) {
        this.artesaniaServicio = artesaniaServicio;
    }

    @GetMapping
    public ResponseEntity<Page<ArtesaniaRespuesta>> listar(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String region,
            @PageableDefault(
                    size = 10,
                    sort = "id",
                    direction = Sort.Direction.ASC)
            Pageable pageable) {
        return ResponseEntity.ok(
                artesaniaServicio.listar(
                        busqueda,
                        region,
                        pageable));
    }

    @GetMapping("/mias")
    @PreAuthorize("hasRole('ARTESANO')")
    public ResponseEntity<Page<ArtesaniaRespuesta>> listarMias(
            Authentication authentication,
            @PageableDefault(
                    size = 10,
                    sort = "id",
                    direction = Sort.Direction.ASC)
            Pageable pageable) {
        return ResponseEntity.ok(
                artesaniaServicio.listarPorArtesano(
                        authentication.getName(),
                        pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArtesaniaRespuesta> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(artesaniaServicio.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ARTESANO')")
    public ResponseEntity<ArtesaniaRespuesta> crear(
            @Valid @RequestBody ArtesaniaPeticion peticion,
            Authentication authentication) {
        ArtesaniaRespuesta creada = artesaniaServicio.crear(
                peticion,
                authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ARTESANO')")
    public ResponseEntity<ArtesaniaRespuesta> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ArtesaniaPeticion peticion,
            Authentication authentication) {
        return ResponseEntity.ok(
                artesaniaServicio.actualizar(
                        id,
                        peticion,
                        authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ARTESANO')")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            Authentication authentication) {
        artesaniaServicio.eliminar(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
