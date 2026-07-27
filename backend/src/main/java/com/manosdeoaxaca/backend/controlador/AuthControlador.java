package com.manosdeoaxaca.backend.controlador;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.manosdeoaxaca.backend.dto.AuthResponse;
import com.manosdeoaxaca.backend.dto.LoginRequest;
import com.manosdeoaxaca.backend.dto.RegistroRequest;
import com.manosdeoaxaca.backend.servicio.AuthServicio;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthControlador {

    private final AuthServicio authServicio;

    public AuthControlador(AuthServicio authServicio) {
        this.authServicio = authServicio;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroRequest peticion) {
        return ResponseEntity.ok(authServicio.registrar(peticion));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest peticion) {
        return ResponseEntity.ok(authServicio.login(peticion));
    }
}