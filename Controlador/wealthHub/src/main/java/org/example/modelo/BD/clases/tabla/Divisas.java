package org.example.modelo.BD.clases.tabla;

import lombok.Data;
import org.example.modelo.BD.apoyo.ColumnaBD;

@Data
public class Divisas
{
    @ColumnaBD("codigo")            private String codigo; //
    @ColumnaBD("descripcion")	    private String descripcion;    }
