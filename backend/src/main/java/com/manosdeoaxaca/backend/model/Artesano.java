package com.manosdeoaxaca.backend.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "artesano")
public class Artesano {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "comunidad_id", nullable = false)
    private Comunidad comunidad;

    @Column(length = 18)
    private String curp;

    @Column(columnDefinition = "TEXT")
    private String biografia;

    @Column(name = "anios_oficio")
    private Integer aniosOficio;

    @Column(length = 80)
    private String lengua;

    @Column(name = "estado_validacion", nullable = false, length = 20)
    private String estadoValidacion = "EN_REVISION";

    @ManyToOne
    @JoinColumn(name = "validado_por")
    private Usuario validadoPor;

    @Column(name = "validado_en")
    private LocalDateTime validadoEn;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "artesano_especialidad",
        joinColumns = @JoinColumn(name = "artesano_id"),
        inverseJoinColumns = @JoinColumn(name = "especialidad_id"))
    private Set<Especialidad> especialidades = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Comunidad getComunidad() {
        return comunidad;
    }

    public void setComunidad(Comunidad comunidad) {
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

    public Usuario getValidadoPor() {
        return validadoPor;
    }

    public void setValidadoPor(Usuario validadoPor) {
        this.validadoPor = validadoPor;
    }

    public LocalDateTime getValidadoEn() {
        return validadoEn;
    }

    public void setValidadoEn(LocalDateTime validadoEn) {
        this.validadoEn = validadoEn;
    }

    public Set<Especialidad> getEspecialidades() {
        return especialidades;
    }

    public void setEspecialidades(Set<Especialidad> especialidades) {
        this.especialidades = especialidades;
    }
}