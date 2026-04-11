package Modelo.base.model.tabla;

import Modelo.base.utils.ColumnaBD;
import lombok.Data;

@Data
public class Divisas
{
    @ColumnaBD("codigo")            private String codigo; //
    @ColumnaBD("descripcion")	    private String descripcion;    }
