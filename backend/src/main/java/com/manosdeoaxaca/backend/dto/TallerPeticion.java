package com.manosdeoaxaca.backend.dto;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class TallerPeticion {

    @NotBlank(message = "El nombre del taller es obligatorio")
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

    @NotBlank(message = "La dirección es obligatoria")
    @Size(
        max = 200,
        message = "La dirección no puede exceder 200 caracteres"
    )
    private String direccion;

    @NotBlank(message = "El municipio es obligatorio")
    @Size(
        max = 120,
        message = "El municipio no puede exceder 120 caracteres"
    )
    private String municipio;

    @NotNull(message = "La comunidad es obligatoria")
    @Positive(message = "La comunidad seleccionada no es válida")
    private Long comunidadId;

    private Set<@Positive(
        message = "El artesano seleccionado no es válido"
    ) Long> artesanoIds;

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

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public Long getComunidadId() {
        return comunidadId;
    }

    public void setComunidadId(Long comunidadId) {
        this.comunidadId = comunidadId;
    }

    public Set<Long> getArtesanoIds() {
        return artesanoIds;
    }

    public void setArtesanoIds(Set<Long> artesanoIds) {
        this.artesanoIds = artesanoIds;
    }
}
