package com.manosdeoaxaca.backend.dto;

import java.util.Set;

public class ArtesanoDetalleRespuesta {

    private Long id;
    private Long usuarioId;
    private String nombreUsuario;
    private String correo;
    private Long comunidadId;
    private String comunidad;
    private String curp;
    private String biografia;
    private Integer aniosOficio;
    private String lengua;
    private String estadoValidacion;
    private Set<Long> especialidadIds;
    private Set<String> especialidades;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
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

    public String getCurp() {
        return curp;
    }

    public void setCurp(String curp) {
        this.curp = curp;
    }

    public String getBiografia() {
        return biografia;
    }

    public void setBiografia(String biografia) {
        this.biografia = biografia;
    }

    public Integer getAniosOficio() {
        return aniosOficio;
    }

    public void setAniosOficio(Integer aniosOficio) {
        this.aniosOficio = aniosOficio;
    }

    public String getLengua() {
        return lengua;
    }

    public void setLengua(String lengua) {
        this.lengua = lengua;
    }

    public String getEstadoValidacion() {
        return estadoValidacion;
    }

    public void setEstadoValidacion(String estadoValidacion) {
        this.estadoValidacion = estadoValidacion;
    }

    public Set<Long> getEspecialidadIds() {
        return especialidadIds;
    }

    public void setEspecialidadIds(Set<Long> especialidadIds) {
        this.especialidadIds = especialidadIds;
    }

    public Set<String> getEspecialidades() {
        return especialidades;
    }

    public void setEspecialidades(Set<String> especialidades) {
        this.especialidades = especialidades;
    }
}
