package com.manosdeoaxaca.backend.repositorio;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.manosdeoaxaca.backend.model.PasswordResetToken;

public interface PasswordResetTokenRepositorio extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);
}