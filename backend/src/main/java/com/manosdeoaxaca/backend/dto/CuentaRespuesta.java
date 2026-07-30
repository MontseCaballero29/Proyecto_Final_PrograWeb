package com.manosdeoaxaca.backend.dto;

public class CuentaRespuesta {

    private Long id;
    private String nombre;
    private String correo;
    private String telefono;
    private String rol;
    private String token;

    public CuentaRespuesta(
            Long id,
            String nombre,
            String correo,
            String telefono,
            String rol,
            String token) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.telefono = telefono;
        this.rol = rol;
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getRol() {
        return rol;
    }

    public String getToken() {
        return token;
    }
}
