package Modelo.base.model.tabla;

import Modelo.base.utils.ColumnaBD;
import lombok.Data;

@Data
public class Divisas
{
    /**
     * Objeto correspondiente a la tabla de GESFIN.
     * @GFIN GESFIN.CA_EMAIL_CONCEPTOS
     */
    @ColumnaBD("codigo")            private String codigo; //
    @ColumnaBD("descripcion")	    private String descripcion;    }
