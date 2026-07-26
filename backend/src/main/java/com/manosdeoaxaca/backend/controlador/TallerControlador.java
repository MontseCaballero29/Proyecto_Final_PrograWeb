package com.manosdeoaxaca.backend.controlador;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.manosdeoaxaca.backend.model.Taller;
import com.manosdeoaxaca.backend.servicio.TallerServicio;

@RestController
@RequestMapping("/api/talleres")
public class TallerControlador {

    private final TallerServicio tallerServicio;

    public TallerControlador(TallerServicio tallerServicio) {
        this.tallerServicio = tallerServicio;
    }

    @GetMapping
    public ResponseEntity<List<Taller>> listarTodos() {
        return ResponseEntity.ok(tallerServicio.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Taller> buscarPorId(@PathVariable Long id) {
        return tallerServicio.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Taller> crear(@RequestBody Taller taller) {
        taller.setId(null);

        Taller tallerGuardado = tallerServicio.guardar(taller);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(tallerGuardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Taller> actualizar(
            @PathVariable Long id,
            @RequestBody Taller taller) {

        try {
            Taller tallerActualizado =
                    tallerServicio.actualizar(id, taller);

            return ResponseEntity.ok(tallerActualizado);
        } catch (IllegalArgumentException excepcion) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            tallerServicio.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException excepcion) {
            return ResponseEntity.notFound().build();
        }
    }
}