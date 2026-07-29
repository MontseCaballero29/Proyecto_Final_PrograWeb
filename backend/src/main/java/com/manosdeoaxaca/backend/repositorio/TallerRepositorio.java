package com.manosdeoaxaca.backend.repositorio;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.manosdeoaxaca.backend.model.Taller;

public interface TallerRepositorio extends JpaRepository<Taller, Long> {

    Page<Taller> findByMunicipioContainingIgnoreCase(
            String municipio,
            Pageable pageable);
}
