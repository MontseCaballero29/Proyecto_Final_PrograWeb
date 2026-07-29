package com.manosdeoaxaca.backend.excepciones;

public class SolicitudInvalidaExcepcion extends RuntimeException {

    public SolicitudInvalidaExcepcion(String mensaje) {
        super(mensaje);
    }
}
