package com.manosdeoaxaca.backend.dto;

import java.util.Set;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ArtesanoPeticion {

    @NotNull(message = "El usuario es obligatorio")
    private Long usuarioId;

    @NotNull(message = "La comunidad es obligatoria")
    private Long comunidadId;

    @Size(max = 18, message = "El CURP no puede exceder 18 caracteres")
    @Pattern(
        regexp = "^[A-Z]{4}[0-9]{6}[A-Z]{6}[A-Z0-9]{2}$",
        message = "El formato del CURP no es válido")
    private String curp;

    @Size(max = 2000, message = "La biografía no puede exceder 2000 caracteres")
    private String biografia;

    @Min(value = 0, message = "Los años de oficio no pueden ser negativos")
    @Max(value = 100, message = "Los años de oficio no pueden exceder los 100")
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