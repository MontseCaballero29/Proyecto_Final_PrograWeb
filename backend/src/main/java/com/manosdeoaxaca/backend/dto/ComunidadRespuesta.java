package com.manosdeoaxaca.backend.dto;

public class ComunidadRespuesta {

    private Long id;
    private String nombre;
    private String region;

    public ComunidadRespuesta(
            Long id,
            String nombre,
            String region) {
        this.id = id;
        this.nombre = nombre;
        this.region = region;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getRegion() {
        return region;
    }
}
