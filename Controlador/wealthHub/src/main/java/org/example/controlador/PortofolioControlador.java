package org.example.controlador;
import org.example.repositorio.ActivoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.example.modelo.Activo;

import java.util.List;

@RestController
@RequestMapping("/api/activos")
public class PortofolioControlador {

    @Autowired
    private ActivoRepository activoRepository;

    @GetMapping("/patrimonio/{usuarioId}")
    public double calcularPatrimonioTotal(@PathVariable Long usuarioId) {
        // 1. Buscamos al usuario (puedes usar el findById del repositorio)
        // 2. Traemos su lista de activos
        List<Activo> misActivos = activoRepository.findAll(); // Aquí filtrarías por usuario

        // 3. Sumamos cantidad * precioActual de cada uno
        return misActivos.stream()
                .mapToDouble(a -> a.getCantidad() * a.getPrecioActual())
                .sum();
    }
}

