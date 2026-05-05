package org.example.controlador;

import org.example.modelo.Usuario;
import org.example.servicio.UsuarioServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioControlador {

    @Autowired
    private UsuarioServicio usuarioServicio;

    @PostMapping("/login")
    public String login(@RequestBody Usuario datos) {
        Usuario usuario = usuarioServicio.validarLogin(datos.getEmail(), datos.getPassword());

        if (usuario != null) {
            return "Bienvenido " + usuario.getNombre();
        } else {
            return "Error: Credenciales incorrectas";
        }
    }

    @PostMapping("/registro")
    public Usuario registrar(@RequestBody Usuario nuevoUsuario) {
        return usuarioServicio.guardarUsuario(nuevoUsuario);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerPerfil(@PathVariable Long id) {
        Usuario usuario = usuarioServicio.buscarPorId(id);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/actualizar")
    public Usuario actualizar(@RequestBody Usuario usuarioEditado) {
        return usuarioServicio.guardarUsuario(usuarioEditado);
    }


}