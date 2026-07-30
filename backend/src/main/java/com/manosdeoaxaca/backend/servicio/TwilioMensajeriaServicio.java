package com.manosdeoaxaca.backend.servicio;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.manosdeoaxaca.backend.model.Artesano;
import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class TwilioMensajeriaServicio {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(TwilioMensajeriaServicio.class);

    private final boolean habilitado;
    private final String accountSid;
    private final String authToken;
    private final String numeroSms;
    private final String numeroWhatsApp;

    public TwilioMensajeriaServicio(
            @Value("${twilio.enabled:false}") boolean habilitado,
            @Value("${twilio.account-sid:}") String accountSid,
            @Value("${twilio.auth-token:}") String authToken,
            @Value("${twilio.sms.from:}") String numeroSms,
            @Value("${twilio.whatsapp.from:}") String numeroWhatsApp) {
        this.habilitado = habilitado;
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.numeroSms = numeroSms;
        this.numeroWhatsApp = numeroWhatsApp;
    }

    public void enviarSmsRegistroArtesano(Artesano artesano) {
        String telefono = artesano.getUsuario().getTelefono();
        String mensaje = "Hola "
                + artesano.getUsuario().getNombre()
                + ", tu perfil de artesano fue registrado en "
                + "Manos de Oaxaca y se encuentra en revisión.";

        enviar(telefono, numeroSms, mensaje, false, "SMS");
    }

    public void enviarWhatsAppAprobacionArtesano(Artesano artesano) {
        String telefono = artesano.getUsuario().getTelefono();
        String mensaje = "Hola "
                + artesano.getUsuario().getNombre()
                + ", tu perfil de artesano fue aprobado en "
                + "Manos de Oaxaca. Tu validación quedó completada correctamente.";

        enviar(telefono, numeroWhatsApp, mensaje, true, "WhatsApp");
    }

    private void enviar(
            String destino,
            String origen,
            String mensaje,
            boolean whatsapp,
            String canal) {
        if (!habilitado) {
            LOGGER.info(
                    "Twilio está deshabilitado; no se envió el mensaje de {}.",
                    canal);
            return;
        }

        if (estaVacio(accountSid) || estaVacio(authToken)
                || estaVacio(origen)) {
            LOGGER.warn(
                    "No se envió el mensaje de {} porque faltan credenciales "
                            + "o número de origen de Twilio.",
                    canal);
            return;
        }

        if (estaVacio(destino)) {
            LOGGER.warn(
                    "No se envió el mensaje de {} porque el usuario no tiene teléfono.",
                    canal);
            return;
        }

        String destinoFinal = whatsapp
                ? agregarPrefijoWhatsApp(destino)
                : destino;
        String origenFinal = whatsapp
                ? agregarPrefijoWhatsApp(origen)
                : origen;

        try {
            Twilio.init(accountSid, authToken);
            Message enviado = Message.creator(
                    new PhoneNumber(destinoFinal),
                    new PhoneNumber(origenFinal),
                    mensaje)
                    .create();

            LOGGER.info(
                    "Mensaje de {} solicitado correctamente. SID: {}",
                    canal,
                    enviado.getSid());
        } catch (ApiException excepcion) {
            LOGGER.error(
                    "Twilio rechazó el mensaje de {}: {}",
                    canal,
                    excepcion.getMessage());
        } catch (RuntimeException excepcion) {
            LOGGER.error(
                    "No fue posible enviar el mensaje de {}: {}",
                    canal,
                    excepcion.getMessage());
        }
    }

    private String agregarPrefijoWhatsApp(String telefono) {
        return telefono.startsWith("whatsapp:")
                ? telefono
                : "whatsapp:" + telefono;
    }

    private boolean estaVacio(String valor) {
        return valor == null || valor.isBlank();
    }
}
