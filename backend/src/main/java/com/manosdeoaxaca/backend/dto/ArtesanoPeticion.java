package com.manosdeoaxaca.backend.dto;

import java.util.Set;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ArtesanoPeticion {

    @NotNull(message = "El usuario es obligatorio")
    private Long usuarioId;

    @NotNull(message = "La comunidad es obligatoria")
    private Long comunidadId;

    @Size(max = 18, message = "El CURP no puede exceder 18 caracteres")
    private String curp;

    private String biografia;

    private Integer aniosOficio;

    @Size(max = 80, message = "La lengua no puede exceder 80 caracteres")
    private String lengua;

    private Set<Long> especialidadIds;

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Long getComunidadId() {
        return comunidadId;
    }

    public void setComunidadId(Long comunidadId) {
        this.comunidadId = comunidadId;
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

    public Set<Long> getEspecialidadIds() {
        return especialidadIds;
    }

    public void setEspecialidadIds(Set<Long> especialidadIds) {
        this.especialidadIds = especialidadIds;
    }
}