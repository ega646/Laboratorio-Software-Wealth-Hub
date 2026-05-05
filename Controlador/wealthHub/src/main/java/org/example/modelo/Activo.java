package org.example.modelo;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "activos")
@Data // Si no tienes Lombok, recuerda generar Getters y Setters manualmente
public class Activo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;   // Ej: "Bitcoin"
    private String ticker;   // Ej: "BTC"
    private String tipo;     // Ej: "Cripto", "Acción", "Efectivo"

    private double cantidad;      // Cuántos tiene (ej: 0.5)
    private double precioCompra;  // A cuánto lo compró
    private double precioActual;  // Valor actual del mercado

    @ManyToOne // Un usuario puede tener muchos activos
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    public Activo() {}

    // Si no usas @Data, haz clic derecho -> Generate -> Getter and Setter de todos los campos
}