package Modelo.base.model;

import lombok.Data;

@Data
public class Param
{
    private String nombre;
    private String valor;

    public Param(String nombre, String valor){
        this.nombre = nombre;
        this.valor  = valor;
    }

    public Param(){
    }
}
