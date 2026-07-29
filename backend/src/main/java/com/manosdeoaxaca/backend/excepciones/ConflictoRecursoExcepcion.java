package com.manosdeoaxaca.backend.excepciones;

public class ConflictoRecursoExcepcion extends RuntimeException {

    public ConflictoRecursoExcepcion(String mensaje) {
        super(mensaje);
    }
}
