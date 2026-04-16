package org.example.controlador;

import org.example.modelo.Usuario;
import org.example.servicio.UsuarioServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.example.servicio.UsuarioServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.modelo.BD.clases.tabla.Divisas;
import org.example.modelo.BD.servicios.tabla.SvcDivisas;



    @RestController
    @RequestMapping("/api/datos")
    @CrossOrigin(origins = "*")
    public class DatosControlador {

        @PostMapping("/divisa/{id}/")
        public Divisas getDivisa(@PathVariable("id") String id) throws Exception {
            Divisas divisa = SvcDivisas.getDivisaPK(id);
            return divisa;
        }

}
