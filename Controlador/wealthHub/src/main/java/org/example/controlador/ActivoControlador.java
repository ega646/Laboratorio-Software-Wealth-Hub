package org.example.controlador;

import org.example.modelo.Activo;
import org.example.repositorio.ActivoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/activos")
@CrossOrigin(origins = "*")
public class ActivoControlador {

    @Autowired
    private ActivoRepository activoRepository;

    // MÉTODO 1: Listar todos los activos del usuario
    @GetMapping("/usuario/{usuarioId}")
    public List<Activo> listarActivos(@PathVariable Long usuarioId) {
        // Aquí podrías filtrar por usuarioId en el futuro
        return activoRepository.findAll();
    }

    // MÉTODO 2: Añadir una nueva inversión (BTC, Acciones, etc.)
    @PostMapping("/add")
    public Activo guardarActivo(@RequestBody Activo nuevoActivo) {
        return activoRepository.save(nuevoActivo);
    }

    // MÉTODO 3: Borrar un activo
    @DeleteMapping("/delete/{id}")
    public void borrarActivo(@PathVariable Long id) {
        activoRepository.deleteById(id);
    }
}