package com.manosdeoaxaca.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "resena",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_resena_usuario_artesano",
            columnNames = {"usuario_id", "artesano_id"}),
        @UniqueConstraint(
            name = "uk_resena_usuario_taller",
            columnNames = {"usuario_id", "taller_id"}),
        @UniqueConstraint(
            name = "uk_resena_usuario_artesania",
            columnNames = {"usuario_id", "artesania_id"})
    })
public class Resena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "artesano_id")
    private Artesano artesano;

    @ManyToOne
    @JoinColumn(name = "taller_id")
    private Taller taller;

    @ManyToOne
    @JoinColumn(name = "artesania_id")
    private Artesania artesania;

    @Column(nullable = false)
    private Integer calificacion;

    @Column(nullable = false, length = 1000)
    private String comentario;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Artesano getArtesano() {
        return artesano;
    }

    public void setArtesano(Artesano artesano) {
        this.artesano = artesano;
    }

    public Taller getTaller() {
        return taller;
    }

    public void setTaller(Taller taller) {
        this.taller = taller;
    }

    public Artesania getArtesania() {
        return artesania;
    }

    public void setArtesania(Artesania artesania) {
        this.artesania = artesania;
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

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }
}
