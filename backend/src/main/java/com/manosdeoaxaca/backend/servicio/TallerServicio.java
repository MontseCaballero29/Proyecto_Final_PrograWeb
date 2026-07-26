package com.manosdeoaxaca.backend.servicio;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.manosdeoaxaca.backend.model.Taller;
import com.manosdeoaxaca.backend.repositorio.TallerRepositorio;

@Service
public class TallerServicio {

    private final TallerRepositorio tallerRepositorio;

    public TallerServicio(TallerRepositorio tallerRepositorio) {
        this.tallerRepositorio = tallerRepositorio;
    }

    public List<Taller> listarTodos() {
        return tallerRepositorio.findAll();
    }

    public Optional<Taller> buscarPorId(Long id) {
        return tallerRepositorio.findById(id);
    }

    public Taller guardar(Taller taller) {
        return tallerRepositorio.save(taller);
    }

    public Taller actualizar(Long id, Taller datosActualizados) {
        Taller taller = tallerRepositorio.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No se encontró el taller con id: " + id));

        taller.setNombre(datosActualizados.getNombre());
        taller.setDescripcion(datosActualizados.getDescripcion());
        taller.setDireccion(datosActualizados.getDireccion());
        taller.setMunicipio(datosActualizados.getMunicipio());
        taller.setComunidad(datosActualizados.getComunidad());
        taller.setArtesanos(datosActualizados.getArtesanos());

        return tallerRepositorio.save(taller);
    }

    public void eliminar(Long id) {
        if (!tallerRepositorio.existsById(id)) {
            throw new IllegalArgumentException(
                    "No se encontró el taller con id: " + id);
        }

        tallerRepositorio.deleteById(id);
    }
}