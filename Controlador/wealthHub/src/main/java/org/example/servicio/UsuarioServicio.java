package org.example.servicio;

import org.example.modelo.Usuario;
import org.example.repositorio.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioServicio {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario validarLogin(String email, String password) {
        Usuario user = usuarioRepository.findByEmail(email);

        if (user != null && user.getPassword().equals(password)) {
            return user; // Login correcto
        }
        return null; // Login fallido
    }
}