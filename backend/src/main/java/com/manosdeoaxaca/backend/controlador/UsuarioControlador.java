package com.manosdeoaxaca.backend.controlador;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.manosdeoaxaca.backend.dto.ActualizarCuentaPeticion;
import com.manosdeoaxaca.backend.dto.CambiarPasswordPeticion;
import com.manosdeoaxaca.backend.dto.CuentaRespuesta;
import com.manosdeoaxaca.backend.dto.UsuarioDisponibleRespuesta;
import com.manosdeoaxaca.backend.servicio.UsuarioServicio;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioControlador {

    private final UsuarioServicio usuarioServicio;

    public UsuarioControlador(UsuarioServicio usuarioServicio) {
        this.usuarioServicio = usuarioServicio;
    }

    @GetMapping("/disponibles-artesano")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioDisponibleRespuesta>> listarDisponibles() {
        return ResponseEntity.ok(
                usuarioServicio.listarDisponiblesParaArtesano());
    }

    @GetMapping("/me")
    public ResponseEntity<CuentaRespuesta> obtenerCuenta(
            Authentication authentication) {
        return ResponseEntity.ok(
                usuarioServicio.obtenerCuenta(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<CuentaRespuesta> actualizarCuenta(
            Authentication authentication,
            @Valid @RequestBody ActualizarCuentaPeticion peticion) {
        return ResponseEntity.ok(
                usuarioServicio.actualizarCuenta(
                        authentication.getName(),
                        peticion));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> cambiarPassword(
            Authentication authentication,
            @Valid @RequestBody CambiarPasswordPeticion peticion) {
        usuarioServicio.cambiarPassword(
                authentication.getName(),
                peticion);
        return ResponseEntity.noContent().build();
    }
}
