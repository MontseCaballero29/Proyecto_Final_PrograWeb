package com.manosdeoaxaca.backend.servicio;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class CorreoServicio {

    private static final Logger LOGGER = LoggerFactory.getLogger(CorreoServicio.class);

    private final String urlFrontend;

    public CorreoServicio(@Value("${app.url-frontend:http://localhost:5173}") String urlFrontend) {
        this.urlFrontend = urlFrontend;
    }

    public void enviarCorreoRecuperacion(String correoDestino, String token) {
        String enlace = urlFrontend + "/restablecer?token=" + token;

        LOGGER.info("CORREO DE RECUPERACION (modo log, sin envio real)");
        LOGGER.info("Para: {}", correoDestino);
        LOGGER.info("Enlace de recuperacion: {}", enlace);
    }
}