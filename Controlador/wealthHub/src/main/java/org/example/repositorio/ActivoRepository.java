package org.example.repositorio;

import org.example.modelo.Activo;
import org.example.modelo.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivoRepository extends JpaRepository<Activo, Long> {

    // Método para obtener solo los activos de un usuario concreto
    List<Activo> findByUsuario(Usuario usuario);
}