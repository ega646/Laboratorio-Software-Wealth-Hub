package Modelo.base.model;

import Modelo.base.service.SvcPL;
import Modelo.base.service.SvcUtl;
import lombok.Data;

import java.util.ArrayList;
import java.util.Arrays;

@Data
public class PrcParam
{
    private final ArrayList<String> tipOblig = new ArrayList<>(Arrays.asList("S","N","OP","OP1"));

    private String parametro;
    private Object valor;          // valor del parámetro
    private String obligatiorio;  // "S" Obligatorio, "N" No obligatorio, "Op" Opcional (al menos 1 entre los Op)

    public PrcParam(String parametro, Object valor, String obligatiorio) throws Exception {
        if (SvcUtl.isNuloOVacio(parametro))
            throw new Exception(getClass().getSimpleName()+") El parámetro 'parametro' es obligatorio.");

        if (SvcUtl.isNuloOVacio(obligatiorio))
            throw new Exception(getClass().getSimpleName()+") El parámetro 'obligatorio' de '"+parametro+"' es obligatorio.");

        if (!(tipOblig.contains(obligatiorio.toUpperCase())))
            throw new Exception(getClass().getSimpleName()+") El atributo 'obligatorio' de '"+parametro+"' debe ser ('S','N','Op').");

        this.valor = valor;
        this.parametro = parametro;
        this.obligatiorio = obligatiorio;
    }

    public String toString()
    {
        return "[parametro:"+ this.parametro+",valor:" + SvcPL.nvl(this.parametro,"(vacío)")+",obligatiorio:"+this.parametro +"]";
    }

}
