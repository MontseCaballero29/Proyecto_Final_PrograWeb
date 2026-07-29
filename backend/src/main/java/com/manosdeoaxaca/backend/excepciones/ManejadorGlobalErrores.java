package com.manosdeoaxaca.backend.excepciones;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ManejadorGlobalErrores {

    @ExceptionHandler(RecursoNoEncontradoExcepcion.class)
    public ResponseEntity<RespuestaError> manejarNoEncontrado(RecursoNoEncontradoExcepcion excepcion) {
        RespuestaError cuerpo = new RespuestaError(
                HttpStatus.NOT_FOUND.value(),
                "No encontrado",
                excepcion.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(cuerpo);
    }

    @ExceptionHandler(ConflictoRecursoExcepcion.class)
    public ResponseEntity<RespuestaError> manejarConflicto(ConflictoRecursoExcepcion excepcion) {
        RespuestaError cuerpo = new RespuestaError(
                HttpStatus.CONFLICT.value(),
                "Conflicto",
                excepcion.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(cuerpo);
    }

    @ExceptionHandler(SolicitudInvalidaExcepcion.class)
    public ResponseEntity<RespuestaError> manejarSolicitudInvalida(
            SolicitudInvalidaExcepcion excepcion) {
        RespuestaError cuerpo = new RespuestaError(
                HttpStatus.BAD_REQUEST.value(),
                "Solicitud inválida",
                excepcion.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(cuerpo);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RespuestaError> manejarValidacion(MethodArgumentNotValidException excepcion) {
        String primerError = excepcion.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("Datos inválidos");

        RespuestaError cuerpo = new RespuestaError(
                HttpStatus.BAD_REQUEST.value(),
                "Datos inválidos",
                primerError);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(cuerpo);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<RespuestaError> manejarAccesoDenegado(AccessDeniedException excepcion) {
        RespuestaError cuerpo = new RespuestaError(
                HttpStatus.FORBIDDEN.value(),
                "Acceso denegado",
                "No tienes permisos para realizar esta acción");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(cuerpo);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<RespuestaError> manejarNoAutenticado(AuthenticationException excepcion) {
        RespuestaError cuerpo = new RespuestaError(
                HttpStatus.UNAUTHORIZED.value(),
                "No autenticado",
                "Credenciales inválidas o token ausente");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(cuerpo);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<RespuestaError> manejarErrorGeneral(Exception excepcion) {
        RespuestaError cuerpo = new RespuestaError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Error interno",
                "Ocurrió un error inesperado en el servidor");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(cuerpo);
    }
}
