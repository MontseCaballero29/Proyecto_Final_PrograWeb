package com.manosdeoaxaca.backend.excepciones;

import java.time.LocalDateTime;

public class RespuestaError {

    private LocalDateTime fecha;
    private int estado;
    private String error;
    private String mensaje;

    public RespuestaError(int estado, String error, String mensaje) {
        this.fecha = LocalDateTime.now();
        this.estado = estado;
        this.error = error;
        this.mensaje = mensaje;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public int getEstado() {
        return estado;
    }

    public String getError() {
        return error;
    }

    public String getMensaje() {
        return mensaje;
    }
}