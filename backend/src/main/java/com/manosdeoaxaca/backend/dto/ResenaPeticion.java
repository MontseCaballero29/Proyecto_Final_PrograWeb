package com.manosdeoaxaca.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class ResenaPeticion {

    @NotBlank(message = "El tipo de recurso es obligatorio")
    @Pattern(
        regexp = "ARTESANO|TALLER|ARTESANIA",
        message = "El tipo de recurso no es válido")
    private String tipoRecurso;

    @NotNull(message = "El recurso es obligatorio")
    @Positive(message = "El recurso seleccionado no es válido")
    private Long recursoId;

    @NotNull(message = "La calificación es obligatoria")
    @Min(value = 1, message = "La calificación mínima es 1")
    @Max(value = 5, message = "La calificación máxima es 5")
    private Integer calificacion;

    @NotBlank(message = "El comentario es obligatorio")
    @Size(
        min = 10,
        max = 1000,
        message = "El comentario debe tener entre 10 y 1000 caracteres")
    private String comentario;

    public String getTipoRecurso() {
        return tipoRecurso;
    }

    public void setTipoRecurso(String tipoRecurso) {
        this.tipoRecurso = tipoRecurso;
    }

    public Long getRecursoId() {
        return recursoId;
    }

    public void setRecursoId(Long recursoId) {
        this.recursoId = recursoId;
    }

    public Integer getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(Integer calificacion) {
        this.calificacion = calificacion;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }
}
