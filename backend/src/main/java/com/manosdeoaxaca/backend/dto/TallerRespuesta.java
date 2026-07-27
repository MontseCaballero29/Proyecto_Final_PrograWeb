package com.manosdeoaxaca.backend.dto;

import java.util.Set;

public class TallerRespuesta {

    private Long id;
    private String nombre;
    private String descripcion;
    private String direccion;
    private String municipio;

    private Long comunidadId;
    private String comunidad;

    private Set<Long> artesanoIds;
    private Set<String> artesanos;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getComunidad() {
        return comunidad;
    }

    public void setComunidad(String comunidad) {
        this.comunidad = comunidad;
    }

    public Set<Long> getArtesanoIds() {
        return artesanoIds;
    }

    public void setArtesanoIds(Set<Long> artesanoIds) {
        this.artesanoIds = artesanoIds;
    }

    public Set<String> getArtesanos() {
        return artesanos;
    }

    public void setArtesanos(Set<String> artesanos) {
        this.artesanos = artesanos;
    }
}