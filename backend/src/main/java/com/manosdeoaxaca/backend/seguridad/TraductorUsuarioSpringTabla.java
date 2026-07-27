package com.manosdeoaxaca.backend.seguridad;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.manosdeoaxaca.backend.model.Usuario;
import com.manosdeoaxaca.backend.repositorio.UsuarioRepositorio;

@Service
public class TraductorUsuarioSpringTabla implements UserDetailsService {

    private final UsuarioRepositorio usuarioRepositorio;

    public TraductorUsuarioSpringTabla(UsuarioRepositorio usuarioRepositorio) {
        this.usuarioRepositorio = usuarioRepositorio;
    }

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepositorio.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException("No existe un usuario con el correo: " + correo));

        String nombreRol = "ROLE_" + usuario.getRol().getNombre();
        List<SimpleGrantedAuthority> permisos = List.of(new SimpleGrantedAuthority(nombreRol));

        return new User(usuario.getCorreo(), usuario.getPasswordHash(), permisos);
    }
}