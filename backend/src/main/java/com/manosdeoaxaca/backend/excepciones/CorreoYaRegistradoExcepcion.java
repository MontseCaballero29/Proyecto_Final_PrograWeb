package com.manosdeoaxaca.backend.excepciones;

public class CorreoYaRegistradoExcepcion extends RuntimeException {

    public CorreoYaRegistradoExcepcion(String correo) {
        super("Ya existe un usuario registrado con el correo " + correo);
    }
}
