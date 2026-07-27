package com.manosdeoaxaca.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ArtesaniaPeticion {

    @NotBlank(message = "El nombre de la artesanía es obligatorio")
    @Size(
        max = 120,
        message = "El nombre no puede exceder 120 caracteres"
    )
    private String nombre;

    @Size(
        max = 1000,
        message = "La descripción no puede exceder 1000 caracteres"
    )
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(
        value = "0.01",
        message = "El precio debe ser mayor que cero"
    )
    private BigDecimal precio;

    @NotNull(message = "La existencia es obligatoria")
    @Min(
        value = 0,
        message = "La existencia no puede ser negativa"
    )
    private Integer existencia;

    @Size(
        max = 255,
        message = "La URL de la imagen no puede exceder 255 caracteres"
    )
    private String imagenUrl;

    @NotNull(message = "El taller es obligatorio")
    private Long tallerId;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public Integer getExistencia() {
        return existencia;
    }

    public void setExistencia(Integer existencia) {
        this.existencia = existencia;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public Long getTallerId() {
        return tallerId;
    }

    public void setTallerId(Long tallerId) {
        this.tallerId = tallerId;
    }
}