package com.manosdeoaxaca.backend.seguridad;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class FiltroJwt extends OncePerRequestFilter {

    private final JwtServicio jwtServicio;
    private final TraductorUsuarioSpringTabla traductorUsuario;

    public FiltroJwt(JwtServicio jwtServicio, TraductorUsuarioSpringTabla traductorUsuario) {
        this.jwtServicio = jwtServicio;
        this.traductorUsuario = traductorUsuario;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        if (!jwtServicio.tokenEsValido(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String correo = jwtServicio.extraerCorreo(token);

        if (correo != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails usuario = traductorUsuario.loadUserByUsername(correo);

            UsernamePasswordAuthenticationToken autenticacion = new UsernamePasswordAuthenticationToken(
                    usuario, null, usuario.getAuthorities());
            autenticacion.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(autenticacion);
        }

        filterChain.doFilter(request, response);
    }
}